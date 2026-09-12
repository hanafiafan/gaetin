const express = require("express");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");
const QRCode = require("qrcode");
const pino = require("pino");
const path = require("path");
const fs = require("fs/promises");
const { createReceiptStore, createWebhookOutbox } = require("./durable");

// ==================== Config ====================

const PORT = process.env.PORT || 3001;
const TOKEN = process.env.GATEWAY_TOKEN;
const SESSION_DIR = process.env.SESSION_DIR || "./wa-sessions";
const WEBHOOK_URL = process.env.WEBHOOK_URL; // URL Next.js webhook endpoint
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

if (!TOKEN) {
  console.error("❌ GATEWAY_TOKEN environment variable is required");
  process.exit(1);
}

const logger = pino({ level: "warn" }); // suppress noisy Baileys logs

// ==================== In-memory sessions ====================

/**
 * @type {Map<string, {
 *   sock: any,
 *   status: "connecting"|"connected"|"disconnected",
 *   qr: string|null,
 *   phone: string|null,
 *   reconnects: number,
 *   reconnectTimer: NodeJS.Timeout|null
 * }>}
 */
const sessions = new Map();
// accountId -> in-flight startConnection() promise, dedupes concurrent calls
// (e.g. /connect racing /send's auto-reconnect) so we never open two Baileys
// sockets against the same credential files at once.
const connecting = new Map();

const MAX_RECONNECT = 10;
const RECONNECT_DELAY_MS = 10_000;

// ==================== Webhook helper ====================

const durableDir = path.join(SESSION_DIR, ".gateway");
const sendOnce = createReceiptStore(path.join(durableDir, "receipts"));
const webhookOutbox = createWebhookOutbox(path.join(durableDir, "outbox"), async (payload) => {
  if (!WEBHOOK_URL || !WEBHOOK_SECRET) throw new Error("Webhook configuration missing");
  const res = await fetch(WEBHOOK_URL, {
    method: "POST", signal: AbortSignal.timeout(15000),
    headers: { "Content-Type": "application/json", "x-webhook-secret": WEBHOOK_SECRET },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Webhook HTTP ${res.status}`);
});
async function callWebhook(payload) { await webhookOutbox.enqueue(payload); }
setInterval(() => { void webhookOutbox.flush().catch(console.error); }, 5000).unref();

// ==================== Connection manager ====================

async function startConnection(accountId) {
  const existing = sessions.get(accountId);
  // Guard only when active socket exists — sock=null means we're mid-reconnect, allow it
  if (existing?.sock && (existing.status === "connecting" || existing.status === "connected")) return;

  // Dedupe concurrent calls for the same account while a start is already in
  // flight (sock is still null at this point, so the check above can't catch it).
  const inFlight = connecting.get(accountId);
  if (inFlight) return inFlight;

  const promise = doStartConnection(accountId, existing).finally(() => connecting.delete(accountId));
  connecting.set(accountId, promise);
  return promise;
}

async function doStartConnection(accountId, existing) {
  if (existing?.reconnectTimer) clearTimeout(existing.reconnectTimer);

  const entry = {
    sock: null,
    status: "connecting",
    qr: null,
    phone: existing?.phone ?? null,
    reconnects: existing?.reconnects ?? 0,
    reconnectTimer: null,
  };
  sessions.set(accountId, entry);

  const dir = path.join(SESSION_DIR, accountId);
  await fs.mkdir(dir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(dir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger,
    browser: Browsers.ubuntu("Chrome"),
    connectTimeoutMs: 30_000,
    keepAliveIntervalMs: 25_000,
  });
  entry.sock = sock;

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(`[${accountId}] QR generated at ${new Date().toISOString()}`);
      entry.qr = await QRCode.toDataURL(qr);
    }

    if (connection === "open") {
      entry.status = "connected";
      entry.qr = null;
      entry.reconnects = 0;
      entry.phone = sock.user?.id?.split(":")[0] ?? null;
      console.log(`[${accountId}] Connected — phone: +${entry.phone}`);
      await callWebhook({ event: "connected", accountId, phone: entry.phone });
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      const msg = lastDisconnect?.error?.message ?? "";
      const loggedOut = code === DisconnectReason.loggedOut;
      console.log(`[${accountId}] Disconnected at ${new Date().toISOString()} — code: ${code} msg: ${msg} loggedOut: ${loggedOut} reconnects: ${entry.reconnects}/${MAX_RECONNECT}`);

      entry.sock = null;

      if (!loggedOut && entry.reconnects < MAX_RECONNECT) {
        entry.reconnects++;
        entry.status = "connecting";
        entry.qr = null;
        // 515 = restartRequired: reconnect cepat (2s), error lain tunggu lebih lama
        const delay = code === 515 ? 2_000 : RECONNECT_DELAY_MS;
        entry.reconnectTimer = setTimeout(() => startConnection(accountId).catch(console.error), delay);
      } else {
        entry.status = "disconnected";
        sessions.delete(accountId);
        if (loggedOut) {
          await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
        }
        await callWebhook({ event: "disconnected", accountId });
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      const jid = msg.key.remoteJid ?? "";
      if (!jid.endsWith("@s.whatsapp.net")) continue;
      const phone = jid.split("@")[0];
      const text =
        msg.message?.conversation ??
        msg.message?.extendedTextMessage?.text ??
        "";
      await callWebhook({
        event: "message",
        accountId,
        phone,
        text,
        msgId: msg.key.id ?? null,
      });
    }
  });
}

async function disconnectAccount(accountId) {
  const entry = sessions.get(accountId);
  if (entry?.reconnectTimer) clearTimeout(entry.reconnectTimer);
  if (entry?.sock) {
    try { await entry.sock.logout(); } catch { /* ignore */ }
  }
  sessions.delete(accountId);
  const dir = path.join(SESSION_DIR, accountId);
  await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
}

// ==================== Express app ====================

const app = express();
app.use(express.json());

// Auth middleware (skip for health check)
app.use((req, res, next) => {
  if (req.path === "/health") return next();
  if (req.headers.authorization !== `Bearer ${TOKEN}`) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  const accountId = req.path.split("/")[2] || req.body?.accountId;
  if (accountId && (typeof accountId !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(accountId))) {
    return res.status(400).json({ ok: false, error: "Invalid accountId" });
  }
  next();
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, sessions: sessions.size });
});

// Start connection
app.post("/connect/:accountId", async (req, res) => {
  try {
    await startConnection(req.params.accountId);
    const e = sessions.get(req.params.accountId);
    res.json({ ok: true, status: e?.status ?? "connecting" });
  } catch (err) {
    console.error(`[connect] ${err.message}`);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get QR + status
app.get("/qr/:accountId", (req, res) => {
  const e = sessions.get(req.params.accountId);
  res.json({
    status: e?.status ?? "disconnected",
    qr: e?.qr ?? null,
    phone: e?.phone ?? null,
  });
});

// Disconnect
app.post("/disconnect/:accountId", async (req, res) => {
  try {
    await disconnectAccount(req.params.accountId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Send text message
app.post("/send", async (req, res) => {
  const { accountId, phone, text, idempotencyKey } = req.body;
  if (typeof idempotencyKey !== "string" || !idempotencyKey || idempotencyKey.length > 200 || !accountId || !phone || !text) {
    return res.status(400).json({ ok: false, error: "accountId, phone, text, idempotencyKey required" });
  }
  try {
    const result = await sendOnce(idempotencyKey, { accountId, phone, text }, async () => {
      let e = sessions.get(accountId);
      if (!e?.sock || e.status !== "connected") {
        await startConnection(accountId);
        const startWait = Date.now();
        while (Date.now() - startWait < 8000) {
          e = sessions.get(accountId);
          if (e?.sock && e.status === "connected") break;
          await new Promise((r) => setTimeout(r, 500));
        }
      }
      if (!e?.sock || e.status !== "connected") {
        const error = new Error("WA_NOT_CONNECTED"); error.definitive = true; throw error;
      }
      const sent = await e.sock.sendMessage(`${phone}@s.whatsapp.net`, { text });
      return sent?.key?.id ?? null;
    });
    res.json(result);
  } catch (err) {
    res.status(503).json({ ok: false, retryable: true, error: err.message });
  }
});

// Check if number is registered on WhatsApp
app.post("/is-registered", async (req, res) => {
  const { accountId, phone } = req.body;
  let e = sessions.get(accountId);
  if (!e?.sock || e.status !== "connected") {
    const sessionPath = path.join(SESSION_DIR, accountId);
    const sessionDirExists = await fs.access(sessionPath).then(() => true, () => false);
    if (sessionDirExists) {
      await startConnection(accountId).catch(() => {});
      const startWait = Date.now();
      while (Date.now() - startWait < 5000) {
        e = sessions.get(accountId);
        if (e?.sock && e.status === "connected") break;
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
  if (!e?.sock || e.status !== "connected") {
    return res.status(400).json({ ok: false, error: "WA_NOT_CONNECTED" });
  }
  try {
    const result = await e.sock.onWhatsApp(`${phone}@s.whatsapp.net`);
    res.json({ ok: true, exists: !!result?.[0]?.exists });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ==================== Start ====================

(async () => {
  await fs.mkdir(SESSION_DIR, { recursive: true });
  try {
    const files = await fs.readdir(SESSION_DIR);
    for (const file of files) {
      const fullPath = path.join(SESSION_DIR, file);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory() && !file.startsWith(".")) {
        console.log(`🔄 Auto-restoring WA session: ${file}`);
        startConnection(file).catch(err => console.error(`Failed auto-restoring ${file}:`, err.message));
      }
    }
  } catch (e) {
    console.error("Error auto-restoring sessions:", e.message);
  }

  app.listen(PORT, () => {
    console.log(`✅ WA Gateway running on port ${PORT}`);
    console.log(`   Sessions dir: ${path.resolve(SESSION_DIR)}`);
    console.log(`   Webhook URL: ${WEBHOOK_URL ?? "(none)"}`);
  });
})();

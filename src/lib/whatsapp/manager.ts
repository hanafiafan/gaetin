import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  type WASocket,
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import path from "path";
import fs from "fs/promises";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { handleIncomingMessage } from "@/lib/inbox/service";

export type AccountStatus = "connecting" | "connected" | "disconnected";

export type WAEvent =
  | { type: "qr"; qr: string }
  | { type: "status"; status: AccountStatus };

type WAListener = (ev: WAEvent) => void;

interface Entry {
  sock?: WASocket;
  qr?: string; // data URL
  status: AccountStatus;
  reconnects: number;
}

// Singleton lintas hot-reload (dev) — koneksi socket harus bertahan antar request.
const g = globalThis as unknown as {
  __waManager?: Map<string, Entry>;
  __waListeners?: Map<string, Set<WAListener>>;
};
const accounts: Map<string, Entry> = g.__waManager ?? new Map();
if (!g.__waManager) g.__waManager = accounts;
const listeners: Map<string, Set<WAListener>> = g.__waListeners ?? new Map();
if (!g.__waListeners) g.__waListeners = listeners;

const MAX_RECONNECT = 3;
const RECONNECT_DELAY_MS = 10_000;

function sessionDir(accountId: string): string {
  return path.join(env.WA_SESSION_DIR, accountId);
}

function notify(accountId: string, ev: WAEvent) {
  listeners.get(accountId)?.forEach((fn) => { try { fn(ev); } catch { /* ignore */ } });
}

/** Subscribe to QR / status events for an account. Returns unsubscribe fn. */
export function addAccountListener(accountId: string, fn: WAListener): () => void {
  if (!listeners.has(accountId)) listeners.set(accountId, new Set());
  listeners.get(accountId)!.add(fn);
  return () => {
    listeners.get(accountId)?.delete(fn);
    if (listeners.get(accountId)?.size === 0) listeners.delete(accountId);
  };
}

/** Mulai/sambungkan akun. Idempoten bila sudah connecting/connected. */
export async function startConnection(accountId: string): Promise<void> {
  const existing = accounts.get(accountId);
  if (existing && (existing.status === "connecting" || existing.status === "connected")) return;

  const entry: Entry = { status: "connecting", reconnects: existing?.reconnects ?? 0 };
  accounts.set(accountId, entry);

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir(accountId));
  const sock = makeWASocket({ auth: state, printQRInTerminal: false });
  entry.sock = sock;

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async (upsert) => {
    if (upsert.type !== "notify") return;
    for (const msg of upsert.messages) {
      if (msg.key.fromMe) continue;
      const jid = msg.key.remoteJid ?? "";
      if (!jid.endsWith("@s.whatsapp.net")) continue;
      const phone = jid.split("@")[0];
      const text = msg.message?.conversation ?? msg.message?.extendedTextMessage?.text ?? "";
      await handleIncomingMessage(accountId, phone, text, msg.key.id ?? undefined).catch(
        () => undefined,
      );
    }
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      entry.qr = await QRCode.toDataURL(qr);
      notify(accountId, { type: "qr", qr: entry.qr });
    }

    if (connection === "open") {
      entry.status = "connected";
      entry.qr = undefined;
      entry.reconnects = 0;
      notify(accountId, { type: "status", status: "connected" });
      const phone = sock.user?.id?.split(":")[0];
      await prisma.messagingAccount
        .update({
          where: { id: accountId },
          data: { status: "CONNECTED", phoneNumber: phone, lastConnected: new Date() },
        })
        .catch(() => undefined);
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } })?.output
        ?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;

      if (!loggedOut && entry.reconnects < MAX_RECONNECT) {
        entry.reconnects += 1;
        entry.status = "connecting";
        notify(accountId, { type: "status", status: "connecting" });
        setTimeout(() => {
          startConnection(accountId).catch(() => undefined);
        }, RECONNECT_DELAY_MS);
      } else {
        entry.status = "disconnected";
        entry.sock = undefined;
        notify(accountId, { type: "status", status: "disconnected" });
        await prisma.messagingAccount
          .update({ where: { id: accountId }, data: { status: "DISCONNECTED" } })
          .catch(() => undefined);
        if (loggedOut) {
          await fs.rm(sessionDir(accountId), { recursive: true, force: true }).catch(() => undefined);
        }
      }
    }
  });
}

export function getState(accountId: string): { status: AccountStatus; qr?: string } {
  const e = accounts.get(accountId);
  if (!e) return { status: "disconnected" };
  return { status: e.status, qr: e.qr };
}

export async function disconnect(accountId: string): Promise<void> {
  const e = accounts.get(accountId);
  try {
    await e?.sock?.logout();
  } catch {
    // abaikan
  }
  accounts.delete(accountId);
  await fs.rm(sessionDir(accountId), { recursive: true, force: true }).catch(() => undefined);
  await prisma.messagingAccount
    .update({ where: { id: accountId }, data: { status: "DISCONNECTED" } })
    .catch(() => undefined);
}

export async function sendText(
  accountId: string,
  phone: string,
  text: string,
): Promise<string | undefined> {
  const e = accounts.get(accountId);
  if (!e?.sock || e.status !== "connected") throw new Error("WA_NOT_CONNECTED");
  const jid = `${phone}@s.whatsapp.net`;
  const result = await e.sock.sendMessage(jid, { text });
  return result?.key?.id ?? undefined;
}

export async function isRegistered(accountId: string, phone: string): Promise<boolean> {
  const e = accounts.get(accountId);
  if (!e?.sock) throw new Error("WA_NOT_CONNECTED");
  const res = await e.sock.onWhatsApp(`${phone}@s.whatsapp.net`);
  return !!res?.[0]?.exists;
}

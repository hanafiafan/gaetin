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

interface Entry {
  sock?: WASocket;
  qr?: string; // data URL
  status: AccountStatus;
  reconnects: number;
}

// Singleton lintas hot-reload (dev) — koneksi socket harus bertahan antar request.
// Catatan: butuh satu instance Node yang berjalan terus (bukan serverless).
const g = globalThis as unknown as { __waManager?: Map<string, Entry> };
const accounts: Map<string, Entry> = g.__waManager ?? new Map();
if (!g.__waManager) g.__waManager = accounts;

const MAX_RECONNECT = 3;
const RECONNECT_DELAY_MS = 10_000;

function sessionDir(accountId: string): string {
  return path.join(env.WA_SESSION_DIR, accountId);
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

  // Pesan masuk -> inbox/CS (Req: inbox dua arah, opt-out, stop follow-up).
  sock.ev.on("messages.upsert", async (upsert) => {
    if (upsert.type !== "notify") return;
    for (const msg of upsert.messages) {
      if (msg.key.fromMe) continue;
      const jid = msg.key.remoteJid ?? "";
      if (!jid.endsWith("@s.whatsapp.net")) continue; // abaikan grup & status
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
    }

    if (connection === "open") {
      entry.status = "connected";
      entry.qr = undefined;
      entry.reconnects = 0;
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
        setTimeout(() => {
          startConnection(accountId).catch(() => undefined);
        }, RECONNECT_DELAY_MS);
      } else {
        entry.status = "disconnected";
        entry.sock = undefined;
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

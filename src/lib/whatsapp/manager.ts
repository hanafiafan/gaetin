/**
 * Thin proxy ke WA Gateway server (Railway).
 * Interface sama seperti sebelumnya agar semua route tidak perlu diubah.
 */
import { gwConnect, gwDisconnect, gwSend, gwIsRegistered } from "./gateway-client";
import { prisma } from "@/lib/db/prisma";

export type AccountStatus = "connecting" | "connected" | "disconnected";

export async function startConnection(accountId: string): Promise<void> {
  await gwConnect(accountId);
}

export async function disconnect(accountId: string): Promise<void> {
  await gwDisconnect(accountId);
  await prisma.messagingAccount
    .update({ where: { id: accountId }, data: { status: "DISCONNECTED" } })
    .catch(() => undefined);
}

export async function sendText(
  accountId: string,
  phone: string,
  text: string,
): Promise<string | undefined> {
  return gwSend(accountId, phone, text);
}

export async function isRegistered(accountId: string, phone: string): Promise<boolean> {
  return gwIsRegistered(accountId, phone);
}

import type {
  IMessagingProvider,
  ConnectResult,
  MessagePayload,
  SendResult,
} from "@/lib/messaging/provider";
import * as wa from "@/lib/whatsapp/manager";
import { prisma } from "@/lib/db/prisma";

export class BaileysProvider implements IMessagingProvider {
  readonly kind = "baileys" as const;

  async connect(accountId: string): Promise<ConnectResult> {
    await wa.startConnection(accountId);
    return { sessionId: accountId, qrCode: undefined, status: "connecting" };
  }

  async disconnect(accountId: string): Promise<void> {
    await wa.disconnect(accountId);
  }

  async getStatus(accountId: string): Promise<ConnectResult["status"]> {
    const row = await prisma.messagingAccount.findUnique({
      where: { id: accountId },
      select: { status: true },
    });
    if (row?.status === "CONNECTED") return "connected";
    if (row?.status === "CONNECTING" || row?.status === "RECONNECTING") return "connecting";
    return "disconnected";
  }

  async sendMessage(
    accountId: string,
    toPhone: string,
    payload: MessagePayload,
  ): Promise<SendResult> {
    try {
      const id = await wa.sendText(accountId, toPhone, payload.text ?? "");
      return { ok: true, waMessageId: id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Gagal mengirim" };
    }
  }

  async isRegistered(accountId: string, toPhone: string): Promise<boolean> {
    return wa.isRegistered(accountId, toPhone);
  }

  onIncomingMessage(): void { /* handled via webhook from gateway */ }
}

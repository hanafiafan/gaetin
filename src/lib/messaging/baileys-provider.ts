import type {
  IMessagingProvider,
  ConnectResult,
  MessagePayload,
  SendResult,
} from "@/lib/messaging/provider";
import * as wa from "@/lib/whatsapp/manager";

/** Implementasi provider berbasis Baileys (self-host, gratis). */
export class BaileysProvider implements IMessagingProvider {
  readonly kind = "baileys" as const;

  async connect(accountId: string): Promise<ConnectResult> {
    await wa.startConnection(accountId);
    const state = wa.getState(accountId);
    return { sessionId: accountId, qrCode: state.qr, status: state.status };
  }

  async disconnect(accountId: string): Promise<void> {
    await wa.disconnect(accountId);
  }

  async getStatus(accountId: string): Promise<ConnectResult["status"]> {
    return wa.getState(accountId).status;
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

  onIncomingMessage(): void {
    // TODO (modul Inbox): wire sock.ev.on("messages.upsert") -> simpan ke Conversation/InboxMessage.
  }
}

// Abstraksi provider WhatsApp. Service lain hanya bergantung pada interface ini,
// sehingga backend (Baileys / gateway / Cloud API resmi) bisa ditukar tanpa
// mengubah logika blast, campaign, inbox, atau validator.

import { BaileysProvider } from "@/lib/messaging/baileys-provider";

export type ProviderKind = "baileys" | "gateway" | "cloud_api";

export interface ConnectResult {
  qrCode?: string; // data URL QR (untuk Baileys)
  sessionId: string;
  status: "connected" | "connecting" | "disconnected";
}

export interface MessagePayload {
  idempotencyKey?: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: "image" | "document" | "video";
  filename?: string;
}

export interface SendResult {
  ok: boolean;
  retryable?: boolean;
  uncertain?: boolean;
  waMessageId?: string;
  error?: string;
}

export interface IMessagingProvider {
  readonly kind: ProviderKind;

  connect(accountId: string): Promise<ConnectResult>;
  disconnect(accountId: string): Promise<void>;
  getStatus(accountId: string): Promise<ConnectResult["status"]>;
  sendMessage(accountId: string, toPhone: string, payload: MessagePayload): Promise<SendResult>;
  isRegistered(accountId: string, toPhone: string): Promise<boolean>;
  onIncomingMessage(
    handler: (accountId: string, fromPhone: string, payload: MessagePayload, waMessageId: string) => void,
  ): void;
}

let cached: IMessagingProvider | null = null;

// Both legacy baileys and gateway settings use the external Baileys gateway.
// Cloud API must fail explicitly until a real adapter exists.
export function getMessagingProvider(): IMessagingProvider {
  if (process.env.WA_PROVIDER === "cloud_api") throw new Error("WhatsApp Cloud API belum dikonfigurasi");
  if (!cached) cached = new BaileysProvider();
  return cached;
}

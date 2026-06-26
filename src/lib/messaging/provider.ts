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
  text?: string;
  mediaUrl?: string;
  mediaType?: "image" | "document" | "video";
  filename?: string;
}

export interface SendResult {
  ok: boolean;
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

// Factory provider. Saat ini hanya Baileys; gateway/Cloud API menyusul dengan
// menambah cabang berdasarkan env.WA_PROVIDER tanpa mengubah pemakai interface.
export function getMessagingProvider(): IMessagingProvider {
  if (!cached) cached = new BaileysProvider();
  return cached;
}

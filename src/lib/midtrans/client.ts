import midtransClient from "midtrans-client";
import { createHash } from "crypto";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";

async function resolveConfig(): Promise<{ isProduction: boolean; serverKey: string; clientKey: string }> {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "midtrans_mode",
            "midtrans_server_key",
            "midtrans_client_key",
            "midtrans_sandbox_server_key",
            "midtrans_sandbox_client_key",
          ],
        },
      },
    });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = typeof r.value === "string" ? r.value : String(r.value ?? "");
    if (map.midtrans_mode) {
      const isProduction = map.midtrans_mode === "live";
      const serverKey = isProduction ? map.midtrans_server_key : map.midtrans_sandbox_server_key;
      const clientKey = isProduction ? map.midtrans_client_key : map.midtrans_sandbox_client_key;
      if (serverKey) return { isProduction, serverKey, clientKey: clientKey ?? "" };
    }
  } catch {}
  return {
    isProduction: env.MIDTRANS_IS_PRODUCTION,
    serverKey: env.MIDTRANS_SERVER_KEY ?? "",
    clientKey: env.MIDTRANS_CLIENT_KEY ?? "",
  };
}

export interface CreateTransactionInput {
  orderId: string;
  amount: number;
  description: string;
  payerEmail?: string;
  successRedirectUrl?: string;
}

export interface CreatedTransaction {
  token: string;
  redirectUrl: string;
}

/** Buat transaksi Midtrans Snap. Mendukung VA, e-wallet, QRIS, kartu. */
export async function createTransaction(input: CreateTransactionInput): Promise<CreatedTransaction> {
  const { isProduction, serverKey, clientKey } = await resolveConfig();
  if (!serverKey) throw new Error("MIDTRANS_NOT_CONFIGURED");

  const snap = new midtransClient.Snap({ isProduction, serverKey, clientKey });
  const res = await snap.createTransaction({
    transaction_details: { order_id: input.orderId, gross_amount: input.amount },
    customer_details: input.payerEmail ? { email: input.payerEmail } : undefined,
    callbacks: input.successRedirectUrl ? { finish: input.successRedirectUrl } : undefined,
  });
  return { token: res.token, redirectUrl: res.redirect_url };
}

/** Resolusi server key aktif — dipakai webhook untuk verifikasi signature_key. */
export async function resolveActiveServerKey(): Promise<string> {
  const { serverKey } = await resolveConfig();
  return serverKey;
}

/** signature_key Midtrans = SHA512(order_id + status_code + gross_amount + ServerKey). */
export function verifyNotificationSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string | undefined,
): boolean {
  if (!serverKey || !signatureKey) return false;
  const expected = createHash("sha512").update(`${orderId}${statusCode}${grossAmount}${serverKey}`).digest("hex");
  return signatureKey === expected;
}

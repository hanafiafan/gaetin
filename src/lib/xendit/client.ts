import { env } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";

const BASE = "https://api.xendit.co";

async function resolveSecretKey(): Promise<string> {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: ["xendit_mode", "xendit_secret_key", "xendit_sandbox_secret_key"] } },
    });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = typeof r.value === "string" ? r.value : String(r.value ?? "");
    const mode = map.xendit_mode ?? "sandbox";
    const key = mode === "live" ? map.xendit_secret_key : map.xendit_sandbox_secret_key;
    if (key) return key;
  } catch {}
  return env.XENDIT_SECRET_KEY ?? "";
}

export interface CreateInvoiceInput {
  externalId: string;
  amount: number;
  description: string;
  payerEmail?: string;
  successRedirectUrl?: string;
}

export interface CreatedInvoice {
  id: string;
  invoiceUrl: string;
}

/** Buat invoice Xendit. Mendukung VA, e-wallet, QRIS, kartu. */
export async function createInvoice(input: CreateInvoiceInput): Promise<CreatedInvoice> {
  const secretKey = await resolveSecretKey();
  if (!secretKey) throw new Error("XENDIT_NOT_CONFIGURED");
  const auth = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch(`${BASE}/v2/invoices`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      external_id: input.externalId,
      amount: input.amount,
      description: input.description,
      payer_email: input.payerEmail,
      success_redirect_url: input.successRedirectUrl,
      currency: "IDR",
    }),
  });
  if (!res.ok) throw new Error("XENDIT_INVOICE_FAILED");
  const d = (await res.json()) as { id: string; invoice_url: string };
  return { id: d.id, invoiceUrl: d.invoice_url };
}

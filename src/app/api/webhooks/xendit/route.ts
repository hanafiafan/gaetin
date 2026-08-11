import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { handlePaidTransaction } from "@/lib/billing/service";

// Webhook Xendit Invoice. Verifikasi via header x-callback-token.
export async function POST(req: NextRequest) {
  const token = req.headers.get("x-callback-token");
  if (!env.XENDIT_WEBHOOK_TOKEN || token !== env.XENDIT_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  let payload: { external_id?: string; status?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  await prisma.webhookEvent
    .create({
      data: {
        source: "xendit",
        orderId: payload.external_id ?? null,
        signatureValid: true,
        payload: payload as object,
        processed: payload.status === "PAID",
      },
    })
    .catch(() => undefined);

  if (payload.status === "PAID" && payload.external_id) {
    try {
      await handlePaidTransaction(payload.external_id);
    } catch {
      // 500 so Xendit retries instead of silently losing the credit/subscription grant.
      return NextResponse.json({ error: "processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

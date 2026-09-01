import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { resolveActiveServerKey, verifyNotificationSignature } from "@/lib/midtrans/client";
import { handlePaidTransaction } from "@/lib/billing/service";

interface MidtransNotification {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
}

// Webhook Midtrans (Snap notification). Verifikasi via signature_key:
// SHA512(order_id + status_code + gross_amount + ServerKey).
export async function POST(req: NextRequest) {
  let payload: MidtransNotification;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const serverKey = await resolveActiveServerKey();
  const validSignature = verifyNotificationSignature(
    payload.order_id ?? "",
    payload.status_code ?? "",
    payload.gross_amount ?? "",
    serverKey,
    payload.signature_key,
  );
  if (!validSignature) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const isPaid =
    payload.transaction_status === "settlement" ||
    (payload.transaction_status === "capture" && payload.fraud_status === "accept");

  await prisma.webhookEvent
    .create({
      data: {
        source: "midtrans",
        orderId: payload.order_id ?? null,
        signatureValid: true,
        payload: payload as object,
        processed: isPaid,
      },
    })
    .catch(() => undefined);

  if (isPaid && payload.order_id) {
    try {
      await handlePaidTransaction(payload.order_id);
    } catch {
      // 500 so Midtrans retries instead of silently losing the credit/subscription grant.
      return NextResponse.json({ error: "processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

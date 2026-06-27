import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { handleIncomingMessage } from "@/lib/inbox/service";

/**
 * Webhook yang dipanggil oleh WA Gateway (Railway) saat ada event:
 * - connected: nomor berhasil terhubung
 * - disconnected: nomor terputus
 * - message: pesan masuk dari pelanggan
 */
export async function POST(req: NextRequest) {
  // Validasi secret agar hanya gateway yang bisa memanggil endpoint ini
  const secret = req.headers.get("x-webhook-secret") ?? "";
  const expected = process.env.WA_WEBHOOK_SECRET ?? "";
  if (expected && secret !== expected) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const { event, accountId, phone, text, msgId } = body as {
    event: string;
    accountId?: string;
    phone?: string;
    text?: string;
    msgId?: string;
  };

  if (!accountId) return NextResponse.json({ ok: false, error: "accountId required" }, { status: 400 });

  if (event === "connected") {
    await prisma.messagingAccount
      .update({
        where: { id: accountId },
        data: { status: "CONNECTED", phoneNumber: phone ?? undefined, lastConnected: new Date() },
      })
      .catch(() => undefined);
  }

  if (event === "disconnected") {
    await prisma.messagingAccount
      .update({ where: { id: accountId }, data: { status: "DISCONNECTED" } })
      .catch(() => undefined);
  }

  if (event === "message" && phone && text !== undefined) {
    await handleIncomingMessage(accountId, phone, text, msgId ?? undefined).catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}

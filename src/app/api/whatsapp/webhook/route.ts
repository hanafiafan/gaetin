import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { handleIncomingMessage, PermanentIncomingError } from "@/lib/inbox/service";
import { secureEqual } from "@/lib/secure-compare";

const Schema = z.discriminatedUnion("event", [
  z.object({ event: z.literal("connected"), accountId: z.string().min(1), phone: z.string().optional() }),
  z.object({ event: z.literal("disconnected"), accountId: z.string().min(1) }),
  z.object({
    event: z.literal("message"),
    accountId: z.string().min(1),
    phone: z.string().min(1),
    text: z.string(),
    msgId: z.string().min(1),
    occurredAt: z.string().datetime().optional(),
    // Lampiran yang sudah diunduh gateway ke folder titipan "inbound/".
    media: z
      .object({
        path: z.string().min(1).max(300),
        kind: z.enum(["image", "document", "video", "audio"]),
        filename: z.string().max(200).optional(),
        mimetype: z.string().max(120).optional(),
      })
      .optional(),
  }),
]);
export async function POST(req: NextRequest) {
  const expected = process.env.WEBHOOK_SECRET ?? "";
  if (!expected || !secureEqual(req.headers.get("x-webhook-secret") ?? "", expected)) return NextResponse.json({ ok: false }, { status: 403 });
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid event" }, { status: 400 });
  const body = parsed.data;
  try {
    if (body.event === "message") await handleIncomingMessage(body.accountId, body.phone, body.text, body.msgId, body.occurredAt ? new Date(body.occurredAt) : new Date(), body.media);
    else await prisma.messagingAccount.updateMany({ where: { id: body.accountId }, data: body.event === "connected"
      ? { status: "CONNECTED", phoneNumber: body.phone, lastConnected: new Date() }
      : { status: "DISCONNECTED" } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    // 503 = "coba lagi nanti", dan antrean gateway MENAHAN seluruh peristiwa di
    // belakangnya sampai yang ini berhasil. Jadi 503 hanya boleh dipakai untuk
    // kegagalan yang memang sementara (database sedang tidak bisa dihubungi).
    // Peristiwa yang bentuknya salah harus dijawab 400 supaya dibuang, kalau
    // tidak satu pesan cacat menyumbat Pesan Masuk selamanya.
    if (err instanceof PermanentIncomingError) {
      console.error("WhatsApp webhook rejected a malformed event", body.accountId, err.message);
      return NextResponse.json({ ok: false, error: "Malformed event; dropped" }, { status: 400 });
    }
    console.error("WhatsApp webhook persistence failed", err);
    return NextResponse.json({ ok: false, error: "Persistence failed; retry required" }, { status: 503 });
  }
}

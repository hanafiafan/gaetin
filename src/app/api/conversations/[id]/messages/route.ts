import { featureDenied } from "@/lib/auth/entitlements";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { deliverWhatsApp, DeliveryBlockedError } from "@/lib/messaging/delivery";
import { InsufficientCreditsError } from "@/lib/credits/service";
import { DailyMessagingQuotaError } from "@/lib/messaging/quota";
import { fail } from "@/lib/api";
import { ownsMedia } from "@/lib/media/storage";

// Teks boleh kosong kalau ada lampiran: mengirim foto tanpa keterangan itu
// wajar. Yang tidak boleh adalah pesan yang sama sekali tidak berisi apa pun.
const MediaSchema = z.object({
  path: z.string().min(1).max(300),
  kind: z.enum(["image", "document", "video"]),
  filename: z.string().min(1).max(200),
  mimetype: z.string().max(120).optional(),
});

const Schema = z
  .object({
    text: z.string().max(4096).default(""),
    media: MediaSchema.optional(),
    clientRequestId: z.string().uuid(),
  })
  .refine((d) => d.text.trim().length > 0 || d.media, { message: "Pesan atau lampiran wajib diisi" });
export async function POST(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "inbox");
  if (denied) return denied;
  const convo = await prisma.conversation.findFirst({ where: { id: params.id, workspaceId: session.workspace.id } });
  if (!convo) return fail("NOT_FOUND", "Percakapan tidak ditemukan", 404);
  if (!convo.messagingAccountId) return fail("WA_NOT_CONNECTED", "Nomor pengirim tidak tersedia", 400);
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  // Lampiran hanya boleh diambil dari folder workspace ini. Path-nya datang
  // dari klien, jadi tidak boleh dipercaya hanya karena tadi kita sendiri yang
  // mengembalikannya saat unggah.
  const media = parsed.data.media;
  if (media && !ownsMedia(session.workspace.id, media.path)) {
    return fail("NOT_FOUND", "Lampiran tidak ditemukan", 404);
  }

  const id = `INBOX:${convo.id}:${parsed.data.clientRequestId}`;
  // Persist the exact intent before sending, so retrying the request cannot change its body.
  const message = await prisma.inboxMessage.upsert({ where: { id }, update: {}, create: { id, conversationId: convo.id, direction: "OUTBOUND", content: parsed.data.text, mediaUrl: media?.path ?? null, authorId: session.user.id, status: "PENDING" } });
  if (message.content !== parsed.data.text || (message.mediaUrl ?? null) !== (media?.path ?? null)) return fail("IDEMPOTENCY_CONFLICT", "ID pesan sudah digunakan", 409);
  try {
    const result = await deliverWhatsApp({ id, workspaceId: session.workspace.id, accountId: convo.messagingAccountId, contactId: convo.contactId, text: parsed.data.text, media });
    const saved = await prisma.$transaction(async (tx) => {
      const saved = await tx.inboxMessage.update({ where: { id }, data: { status: result.status === "SENT" ? "SENT" : "FAILED", waMessageId: result.waMessageId } });
      if (result.status === "SENT") await tx.conversation.update({ where: { id: convo.id }, data: { lastMessageAt: new Date() } });
      return saved;
    });
    if (result.status !== "SENT") return fail("WA_SEND_FAILED", result.error ?? "Gagal mengirim", 502);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err) {
    if (err instanceof InsufficientCreditsError || err instanceof DailyMessagingQuotaError || err instanceof DeliveryBlockedError) {
      // Baris pesannya sengaja ditulis sebelum dikirim supaya percobaan ulang
      // tidak bisa mengubah isinya. Tapi kalau pengirimannya ditolak sejak
      // awal — kredit habis, kuota penuh, nomor opt-out — baris itu tertinggal
      // berstatus PENDING dan di layar tampak persis seperti pesan terkirim.
      await prisma.inboxMessage.updateMany({ where: { id, status: "PENDING" }, data: { status: "FAILED" } });
      return fail("SEND_BLOCKED", err.message, 403);
    }
    console.error("Inbox send pending retry", id, err);
    return fail("WA_RETRY", "Koneksi terganggu. Coba kembali dengan pesan yang sama untuk memeriksa hasil pengiriman.", 503);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { getMessagingProvider } from "@/lib/messaging/provider";
import { fail } from "@/lib/api";

const Schema = z.object({ text: z.string().min(1).max(4096) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const convo = await prisma.conversation.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    include: { contact: { select: { phone: true } } },
  });
  if (!convo) return fail("NOT_FOUND", "Percakapan tidak ditemukan", 404);
  if (!convo.messagingAccountId) return fail("WA_NOT_CONNECTED", "Nomor pengirim tidak tersedia", 400);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const provider = getMessagingProvider();
  const res = await provider.sendMessage(convo.messagingAccountId, convo.contact.phone, {
    text: parsed.data.text,
  });
  if (!res.ok) return fail("WA_SEND_FAILED", res.error ?? "Gagal mengirim", 502);

  const message = await prisma.inboxMessage.create({
    data: {
      conversationId: convo.id,
      direction: "OUTBOUND",
      content: parsed.data.text,
      waMessageId: res.waMessageId,
      status: "SENT",
      authorId: session.user.id,
    },
  });
  await prisma.conversation.update({
    where: { id: convo.id },
    data: { lastMessageAt: new Date() },
  });

  return NextResponse.json({ success: true, data: message }, { status: 201 });
}

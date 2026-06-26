import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const convo = await prisma.conversation.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    include: { contact: { select: { name: true, phone: true } } },
  });
  if (!convo) return fail("NOT_FOUND", "Percakapan tidak ditemukan", 404);

  const messages = await prisma.inboxMessage.findMany({
    where: { conversationId: convo.id },
    orderBy: { createdAt: "asc" },
    take: 500,
  });

  // Tandai sudah dibaca.
  if (convo.unreadCount > 0) {
    await prisma.conversation.update({ where: { id: convo.id }, data: { unreadCount: 0 } });
  }

  return NextResponse.json({
    success: true,
    data: {
      conversation: {
        id: convo.id,
        status: convo.status,
        contact: { name: convo.contact.name, phone: convo.contact.phone },
      },
      messages,
    },
  });
}

const PatchSchema = z.object({ status: z.enum(["OPEN", "PENDING", "RESOLVED"]) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const convo = await prisma.conversation.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    select: { id: true },
  });
  if (!convo) return fail("NOT_FOUND", "Percakapan tidak ditemukan", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  await prisma.conversation.update({ where: { id: convo.id }, data: { status: parsed.data.status } });
  return NextResponse.json({ success: true });
}

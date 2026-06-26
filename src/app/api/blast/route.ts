import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CreateBlastSchema } from "@/lib/validators/blast";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const items = await prisma.blast.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      totalRecipients: true,
      sentCount: true,
      failedCount: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const workspaceId = session.workspace.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = CreateBlastSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const { name, accountId, messageText, scope, label } = parsed.data;

  const account = await prisma.messagingAccount.findFirst({
    where: { id: accountId, workspaceId },
    select: { id: true },
  });
  if (!account) return fail("NOT_FOUND", "Akun WhatsApp tidak ditemukan", 404);

  const where: Prisma.ContactWhereInput = { workspaceId };
  if (scope === "activeWa") where.waStatus = "ACTIVE";
  if (label) where.label = label;

  const contacts = await prisma.contact.findMany({ where, select: { id: true }, take: 10000 });
  if (contacts.length === 0) return fail("EMPTY", "Tidak ada penerima yang cocok", 400);

  const blast = await prisma.blast.create({
    data: {
      workspaceId,
      name,
      messageText,
      variables: { accountId, scope, label: label ?? null },
      totalRecipients: contacts.length,
      status: "DRAFT",
      createdById: session.user.id,
    },
  });

  await prisma.blastMessage.createMany({
    data: contacts.map((c) => ({ blastId: blast.id, contactId: c.id })),
  });

  return NextResponse.json(
    { success: true, data: { id: blast.id, totalRecipients: contacts.length } },
    { status: 201 },
  );
}

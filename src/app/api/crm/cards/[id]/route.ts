import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

const MoveSchema = z.object({ columnId: z.string() });

async function ownedCard(id: string, workspaceId: string) {
  return prisma.pipelineCard.findFirst({
    where: { id, column: { pipeline: { workspaceId } } },
    select: { id: true, contactId: true },
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const workspaceId = session.workspace.id;

  const card = await ownedCard(params.id, workspaceId);
  if (!card) return fail("NOT_FOUND", "Kartu tidak ditemukan", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = MoveSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const column = await prisma.pipelineColumn.findFirst({
    where: { id: parsed.data.columnId, pipeline: { workspaceId } },
    select: { id: true, name: true },
  });
  if (!column) return fail("NOT_FOUND", "Kolom tujuan tidak ditemukan", 404);

  const count = await prisma.pipelineCard.count({ where: { columnId: column.id } });
  await prisma.pipelineCard.update({
    where: { id: card.id },
    data: { columnId: column.id, order: count, movedAt: new Date() },
  });
  await prisma.contact.update({ where: { id: card.contactId }, data: { crmStage: column.name } });

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const card = await ownedCard(params.id, session.workspace.id);
  if (!card) return fail("NOT_FOUND", "Kartu tidak ditemukan", 404);

  await prisma.pipelineCard.delete({ where: { id: card.id } });
  return NextResponse.json({ success: true });
}

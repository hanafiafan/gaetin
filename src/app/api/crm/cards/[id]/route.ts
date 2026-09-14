import { featureDenied } from "@/lib/auth/entitlements";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

const MoveSchema = z.object({ columnId: z.string() });

export async function PUT(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "crmPipeline");
  if (denied) return denied;
  const workspaceId = session.workspace.id;


  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = MoveSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Workspace" WHERE id = ${workspaceId} FOR UPDATE`;
    const card = await tx.pipelineCard.findFirst({ where: { id: params.id, column: { pipeline: { workspaceId } } }, include: { column: true } });
    if (!card) return fail("NOT_FOUND", "Kartu tidak ditemukan", 404);
    const column = await tx.pipelineColumn.findFirst({
      where: { id: parsed.data.columnId, pipelineId: card.column.pipelineId, pipeline: { workspaceId } },
      select: { id: true, name: true },
    });
    if (!column) return fail("NOT_FOUND", "Kolom tujuan tidak ditemukan", 404);

    const count = await tx.pipelineCard.count({ where: { columnId: column.id } });
    await tx.pipelineCard.update({
      where: { id: card.id },
      data: { columnId: column.id, order: count, movedAt: new Date() },
    });
    await tx.contact.update({ where: { id: card.contactId }, data: { crmStage: column.name } });

    return NextResponse.json({ success: true });
  });
}

export async function DELETE(_req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "crmPipeline");
  if (denied) return denied;

  const workspaceId = session.workspace.id;
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Workspace" WHERE id = ${workspaceId} FOR UPDATE`;
    const card = await tx.pipelineCard.findFirst({ where: { id: params.id, column: { pipeline: { workspaceId } } } });
    if (!card) return fail("NOT_FOUND", "Kartu tidak ditemukan", 404);

    await tx.pipelineCard.delete({ where: { id: card.id } });
    const remaining = await tx.pipelineCard.findFirst({ where: { contactId: card.contactId }, include: { column: true }, orderBy: { movedAt: "desc" } });
    await tx.contact.update({ where: { id: card.contactId }, data: { crmStage: remaining?.column.name ?? null } });
    return NextResponse.json({ success: true });
  });
}

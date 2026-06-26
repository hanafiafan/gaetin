import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

const Schema = z.object({ contactId: z.string(), columnId: z.string() });

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
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  // Pastikan kolom & kontak milik workspace.
  const column = await prisma.pipelineColumn.findFirst({
    where: { id: parsed.data.columnId, pipeline: { workspaceId } },
    select: { id: true, name: true, pipelineId: true },
  });
  if (!column) return fail("NOT_FOUND", "Kolom tidak ditemukan", 404);

  const contact = await prisma.contact.findFirst({
    where: { id: parsed.data.contactId, workspaceId },
    select: { id: true },
  });
  if (!contact) return fail("NOT_FOUND", "Kontak tidak ditemukan", 404);

  // Hindari kartu ganda untuk kontak yang sama di pipeline ini.
  const existing = await prisma.pipelineCard.findFirst({
    where: { contactId: contact.id, column: { pipelineId: column.pipelineId } },
    select: { id: true },
  });
  if (existing) return fail("DUPLICATE", "Kontak sudah ada di pipeline", 409);

  const count = await prisma.pipelineCard.count({ where: { columnId: column.id } });
  const card = await prisma.pipelineCard.create({
    data: { columnId: column.id, contactId: contact.id, order: count },
  });
  await prisma.contact.update({ where: { id: contact.id }, data: { crmStage: column.name } });

  return NextResponse.json({ success: true, data: card }, { status: 201 });
}

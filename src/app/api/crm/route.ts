import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { ensureDefaultPipeline } from "@/lib/crm/pipeline";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const workspaceId = session.workspace.id;

  let pipeline = await prisma.pipeline.findFirst({
    where: { workspaceId },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: {
          cards: {
            orderBy: { order: "asc" },
            include: { contact: { select: { id: true, name: true, phone: true, score: true } } },
          },
        },
      },
    },
  });

  if (!pipeline) {
    await ensureDefaultPipeline(workspaceId);
    pipeline = await prisma.pipeline.findFirst({
      where: { workspaceId },
      include: {
        columns: {
          orderBy: { order: "asc" },
          include: {
            cards: {
              orderBy: { order: "asc" },
              include: { contact: { select: { id: true, name: true, phone: true, score: true } } },
            },
          },
        },
      },
    });
  }
  if (!pipeline) return fail("NOT_FOUND", "Pipeline tidak ditemukan", 404);

  const columns = pipeline.columns.map((col) => ({
    id: col.id,
    name: col.name,
    color: col.color,
    cards: col.cards.map((c) => ({
      id: c.id,
      contactId: c.contactId,
      name: c.contact.name,
      phone: c.contact.phone,
      score: c.contact.score,
    })),
  }));

  return NextResponse.json({ success: true, data: { pipelineId: pipeline.id, columns } });
}

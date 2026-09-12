import { featureDenied } from "@/lib/auth/entitlements";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { ensureDefaultPipeline } from "@/lib/crm/pipeline";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "crmPipeline");
  if (denied) return denied;
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

  // Kartu yang cuma berisi nama dan nomor tidak memberi tahu apa pun tentang
  // keadaan peluangnya. Dua query agregat — bukan satu query per kartu —
  // menambahkan tugas yang belum selesai dan nilai penjualan yang sudah jadi.
  const contactIds = pipeline.columns.flatMap((col) => col.cards.map((c) => c.contactId));

  const [taskRows, dealRows] = await Promise.all([
    contactIds.length
      ? prisma.task.groupBy({
          by: ["contactId"],
          where: { contactId: { in: contactIds }, status: { not: "COMPLETED" } },
          _count: { _all: true },
          _min: { dueDate: true },
        })
      : Promise.resolve([]),
    contactIds.length
      ? prisma.deal.groupBy({
          by: ["contactId"],
          where: { workspaceId, contactId: { in: contactIds }, status: "WON" },
          _sum: { value: true },
        })
      : Promise.resolve([]),
  ]);

  const taskBy = new Map(taskRows.map((t) => [t.contactId, t]));
  const dealBy = new Map(dealRows.map((d) => [d.contactId, d]));

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
      openTasks: taskBy.get(c.contactId)?._count._all ?? 0,
      nextDueDate: taskBy.get(c.contactId)?._min.dueDate?.toISOString() ?? null,
      wonValue: Number(dealBy.get(c.contactId)?._sum.value ?? 0),
    })),
  }));

  return NextResponse.json({ success: true, data: { pipelineId: pipeline.id, columns } });
}

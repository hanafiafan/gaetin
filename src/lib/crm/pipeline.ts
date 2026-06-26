import { prisma } from "@/lib/db/prisma";

export const DEFAULT_PIPELINE_COLUMNS = [
  { name: "Lead Baru", order: 0, color: "#3b82f6" },
  { name: "Dihubungi", order: 1, color: "#f59e0b" },
  { name: "Negosiasi", order: 2, color: "#8b5cf6" },
  { name: "Closed Won", order: 3, color: "#22c55e" },
  { name: "Closed Lost", order: 4, color: "#ef4444" },
];

export async function ensureDefaultPipeline(workspaceId: string) {
  const existing = await prisma.pipeline.findFirst({
    where: { workspaceId },
    include: { columns: { orderBy: { order: "asc" } } },
  });
  if (existing) return existing;

  return prisma.pipeline.create({
    data: {
      workspaceId,
      name: "Sales Pipeline",
      columns: { create: DEFAULT_PIPELINE_COLUMNS },
    },
    include: { columns: { orderBy: { order: "asc" } } },
  });
}

export async function addContactToFirstPipelineStage(
  workspaceId: string,
  contactId: string,
): Promise<{ added: boolean; cardId?: string }> {
  const pipeline = await ensureDefaultPipeline(workspaceId);
  const firstColumn = pipeline.columns[0];
  if (!firstColumn) return { added: false };

  const existing = await prisma.pipelineCard.findFirst({
    where: { contactId, column: { pipelineId: pipeline.id } },
    select: { id: true },
  });
  if (existing) return { added: false, cardId: existing.id };

  const count = await prisma.pipelineCard.count({ where: { columnId: firstColumn.id } });
  const card = await prisma.pipelineCard.create({
    data: { columnId: firstColumn.id, contactId, order: count },
  });
  await prisma.contact.update({ where: { id: contactId }, data: { crmStage: firstColumn.name } });
  return { added: true, cardId: card.id };
}

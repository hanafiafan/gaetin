import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export { DEFAULT_PIPELINE_COLUMNS, isWonColumn, STAGE_LABEL } from "@/lib/crm/stages";
import { DEFAULT_PIPELINE_COLUMNS } from "@/lib/crm/stages";

async function ensurePipeline(tx: Prisma.TransactionClient, workspaceId: string) {
  const existing = await tx.pipeline.findFirst({
    where: { workspaceId },
    include: { columns: { orderBy: { order: "asc" } } },
  });
  if (existing) return existing;

  return tx.pipeline.create({
    data: {
      workspaceId,
      name: "Sales Pipeline",
      columns: { create: DEFAULT_PIPELINE_COLUMNS },
    },
    include: { columns: { orderBy: { order: "asc" } } },
  });
}

export async function ensureDefaultPipeline(workspaceId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Workspace" WHERE id = ${workspaceId} FOR UPDATE`;
    return ensurePipeline(tx, workspaceId);
  });
}

export async function addContactToFirstPipelineStage(
  workspaceId: string,
  contactId: string,
): Promise<{ added: boolean; cardId?: string }> {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Workspace" WHERE id = ${workspaceId} FOR UPDATE`;
    const contact = await tx.contact.findFirst({ where: { id: contactId, workspaceId }, select: { id: true } });
    if (!contact) return { added: false };
    const pipeline = await ensurePipeline(tx, workspaceId);
    const firstColumn = pipeline.columns[0];
    if (!firstColumn) return { added: false };

    const existing = await tx.pipelineCard.findFirst({
      where: { contactId, column: { pipelineId: pipeline.id } },
      select: { id: true },
    });
    if (existing) return { added: false, cardId: existing.id };

    const count = await tx.pipelineCard.count({ where: { columnId: firstColumn.id } });
    const card = await tx.pipelineCard.create({
      data: { columnId: firstColumn.id, contactId, order: count },
    });
    await tx.contact.update({ where: { id: contactId }, data: { crmStage: firstColumn.name } });
    return { added: true, cardId: card.id };
  });
}

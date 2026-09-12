import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export type JobKind = "CAMPAIGN" | "BLAST" | "EMAIL_BLAST" | "FOLLOW_UP" | "SCRAPER" | "EMAIL_FIND" | "VALIDATION";
export async function enqueue(tx: Prisma.TransactionClient, kind: JobKind, id: string, workspaceId: string, payload: Prisma.InputJsonValue = { id }, runAt = new Date()) {
  return tx.backgroundJob.upsert({
    where: { id: `${kind}:${id}` },
    create: { id: `${kind}:${id}`, kind, workspaceId, payload, runAt },
    update: { status: "READY", generation: { increment: 1 }, attempts: 0, error: null, payload, runAt },
  });
}

/** Status transition and enqueue are atomic. Concurrent execute requests have one winner. */
export async function startSendJob(kind: "CAMPAIGN" | "BLAST" | "EMAIL_BLAST", id: string, workspaceId: string, resume = false) {
  return prisma.$transaction(async (tx) => {
    const changed = kind === "CAMPAIGN"
      ? await tx.campaign.updateMany({ where: { id, workspaceId, status: { in: resume ? ["PAUSED"] : ["DRAFT", "PAUSED", "FAILED"] } }, data: { status: "ACTIVE", startedAt: new Date(), completedAt: null } })
      : kind === "BLAST"
      ? await tx.blast.updateMany({ where: { id, workspaceId, status: { in: ["DRAFT", "STOPPED", "FAILED"] } }, data: { status: "RUNNING", startedAt: new Date(), completedAt: null } })
      : await tx.emailBlast.updateMany({ where: { id, workspaceId, status: { in: ["DRAFT", "STOPPED", "FAILED"] } }, data: { status: "RUNNING", startedAt: new Date(), completedAt: null } });
    if (!changed.count) return false;
    await enqueue(tx, kind, id, workspaceId);
    return true;
  });
}

export async function scheduleDueJobs() {
  const due = await prisma.campaign.findMany({ where: { status: "SCHEDULED", scheduledAt: { lte: new Date() } }, take: 100 });
  for (const c of due) await prisma.$transaction(async (tx) => {
    const claimed = await tx.campaign.updateMany({ where: { id: c.id, status: "SCHEDULED" }, data: { status: "ACTIVE", startedAt: new Date() } });
    if (claimed.count) await enqueue(tx, "CAMPAIGN", c.id, c.workspaceId);
  });
  const rules = await prisma.followUpRule.findMany({ where: { isActive: true }, distinct: ["workspaceId"], select: { workspaceId: true } });
  for (const { workspaceId } of rules) {
    await prisma.$transaction(async (tx) => {
      const job = await tx.backgroundJob.findUnique({ where: { id: `FOLLOW_UP:${workspaceId}` } });
      if (!job || (["DONE", "FAILED"].includes(job.status) && job.updatedAt.getTime() < Date.now() - 60_000)) {
        await enqueue(tx, "FOLLOW_UP", workspaceId, workspaceId);
      }
    });
  }
}

import { prisma } from "@/lib/db/prisma";
import { scrapeEmailFromWebsite } from "@/lib/enrichment/email-scraper";
import { deductCreditsInTransaction, InsufficientCreditsError } from "@/lib/credits/service";
import { enqueue } from "@/lib/jobs/queue";
import { CREDIT_COSTS } from "@/config/plans";

export type EmailFindSource = "LEAD" | "CONTACT";
const MAX_TARGETS_PER_JOB = 500;
// Lead tidak punya field "label" seperti Contact — filter opsional dipetakan ke
// Lead.category untuk sumber LEAD, dan Contact.label untuk sumber CONTACT.
function candidateWhere(workspaceId: string, source: EmailFindSource, label?: string | null) {
  if (source === "LEAD") {
    return { workspaceId, email: null, website: { not: null }, ...(label ? { category: label } : {}) };
  }
  return { workspaceId, email: null, website: { not: null }, ...(label ? { label } : {}) };
}

export async function countCandidates(workspaceId: string, source: EmailFindSource, label?: string | null): Promise<number> {
  const where = candidateWhere(workspaceId, source, label);
  if (source === "LEAD") return prisma.lead.count({ where });
  return prisma.contact.count({ where });
}

async function jobStopped(jobId: string): Promise<boolean> {
  const j = await prisma.emailFindJob.findUnique({ where: { id: jobId }, select: { status: true } });
  return j?.status === "STOPPED";
}

export async function createAndRunEmailFindJob(
  workspaceId: string,
  source: EmailFindSource,
  label: string | undefined,
  createdById: string | undefined,
): Promise<{ id: string; totalTargets: number } | null> {
  const where = candidateWhere(workspaceId, source, label);
  const targets =
    source === "LEAD"
      ? await prisma.lead.findMany({ where, select: { id: true }, take: MAX_TARGETS_PER_JOB })
      : await prisma.contact.findMany({ where, select: { id: true }, take: MAX_TARGETS_PER_JOB });
  if (targets.length === 0) return null;

  const job = await prisma.$transaction(async (tx) => {
  const job = await tx.emailFindJob.create({
    data: {
      workspaceId,
      source,
      label: label || null,
      totalTargets: targets.length,
      status: "RUNNING",
      startedAt: new Date(),
      createdById,
    },
  });

    await enqueue(tx, "EMAIL_FIND", job.id, workspaceId, { id: job.id, source, targetIds: targets.map((t) => t.id) });
    return job;
  });

  return { id: job.id, totalTargets: targets.length };
}

export async function runEmailFindJob(jobId: string, workspaceId: string, source: EmailFindSource, targetIds: string[]): Promise<void> {
  const job = await prisma.emailFindJob.findFirst({ where: { id: jobId, workspaceId } });
  if (!job || job.status !== "RUNNING") return;
  for (let i = job.processed; i < Math.min(targetIds.length, job.processed + 10); i++) {
    if (await jobStopped(jobId)) return;
    const row = source === "LEAD"
      ? await prisma.lead.findFirst({ where: { id: targetIds[i], workspaceId } })
      : await prisma.contact.findFirst({ where: { id: targetIds[i], workspaceId } });
    const email = row?.website && !row.email ? await scrapeEmailFromWebsite(row.website) : null;
    try {
      await prisma.$transaction(async (tx) => {
        const claimed = await tx.emailFindJob.updateMany({ where: { id: jobId, workspaceId, status: "RUNNING", processed: i }, data: { processed: { increment: 1 } } });
        if (!claimed.count || !email || !row) return;
        const changed = source === "LEAD"
          ? await tx.lead.updateMany({ where: { id: row.id, workspaceId, email: null }, data: { email } })
          : await tx.contact.updateMany({ where: { id: row.id, workspaceId, email: null }, data: { email } });
        if (!changed.count) return;
        await deductCreditsInTransaction(tx, workspaceId, CREDIT_COSTS.findEmail, "FIND_EMAIL");
        await tx.emailFindJob.update({ where: { id: jobId }, data: { found: { increment: 1 } } });
      });
    } catch (err) {
      if (err instanceof InsufficientCreditsError) { await prisma.emailFindJob.update({ where: { id: jobId }, data: { status: "STOPPED" } }); return; }
      throw err;
    }
  }
  await prisma.$transaction(async (tx) => {
    const current = await tx.emailFindJob.findUniqueOrThrow({ where: { id: jobId } });
    if (current.status !== "RUNNING") return;
    if (current.processed >= targetIds.length) await tx.emailFindJob.update({ where: { id: jobId }, data: { status: "COMPLETED", completedAt: new Date() } });
    else await enqueue(tx, "EMAIL_FIND", jobId, workspaceId, { id: jobId, source, targetIds });
  });
}

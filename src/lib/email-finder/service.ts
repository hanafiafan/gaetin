import { prisma } from "@/lib/db/prisma";
import { scrapeEmailFromWebsite } from "@/lib/enrichment/email-scraper";

export type EmailFindSource = "LEAD" | "CONTACT";
const MAX_TARGETS_PER_JOB = 500;
const CONCURRENCY = 5;

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

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

  const job = await prisma.emailFindJob.create({
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

  void runEmailFindJob(
    job.id,
    source,
    targets.map((t) => t.id),
  ).catch(() => undefined);

  return { id: job.id, totalTargets: targets.length };
}

async function runEmailFindJob(jobId: string, source: EmailFindSource, targetIds: string[]): Promise<void> {
  let processed = 0;
  let found = 0;
  try {
    const websites =
      source === "LEAD"
        ? await prisma.lead.findMany({ where: { id: { in: targetIds } }, select: { id: true, website: true } })
        : await prisma.contact.findMany({ where: { id: { in: targetIds } }, select: { id: true, website: true } });

    await mapLimit(websites, CONCURRENCY, async (w) => {
      if (await jobStopped(jobId)) return;

      const email = await scrapeEmailFromWebsite(w.website!);
      if (email) {
        if (source === "LEAD") await prisma.lead.update({ where: { id: w.id }, data: { email } });
        else await prisma.contact.update({ where: { id: w.id }, data: { email } });
        found += 1;
      }
      processed += 1;
      await prisma.emailFindJob.update({ where: { id: jobId }, data: { processed, found } });
    });

    const stopped = await jobStopped(jobId);
    await prisma.emailFindJob.update({
      where: { id: jobId },
      data: { status: stopped ? "STOPPED" : "COMPLETED", completedAt: new Date(), processed, found },
    });
  } catch {
    await prisma.emailFindJob
      .update({ where: { id: jobId }, data: { status: "FAILED", processed, found } })
      .catch(() => undefined);
  }
}

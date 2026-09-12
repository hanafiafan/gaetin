import { prisma } from "@/lib/db/prisma";
import { getMessagingProvider } from "@/lib/messaging/provider";
import { deductCreditsInTransaction, InsufficientCreditsError } from "@/lib/credits/service";
import { CREDIT_COSTS } from "@/config/plans";
import { enqueue } from "@/lib/jobs/queue";

export async function getValidation(id: string, workspaceId: string) {
  return prisma.validationRun.findFirst({ where: { id, workspaceId } });
}
export async function stopValidation(id: string, workspaceId: string) {
  await prisma.validationRun.updateMany({ where: { id, workspaceId, status: "running" }, data: { status: "stopped" } });
}
export async function runValidation(jobId: string, workspaceId: string, accountId: string, contactIds: string[]) {
  const job = await getValidation(jobId, workspaceId);
  if (!job || job.status !== "running") return;
  for (let i = job.processed; i < Math.min(contactIds.length, job.processed + 10); i++) {
    const current = await getValidation(jobId, workspaceId);
    if (!current || current.status !== "running") return;
    const c = await prisma.contact.findFirst({ where: { id: contactIds[i], workspaceId } });
    let registered: boolean | null = null;
    if (c) { try { registered = await getMessagingProvider().isRegistered(accountId, c.phone); } catch { /* unavailable is not INACTIVE */ } }
    try {
      await prisma.$transaction(async (tx) => {
        const claimed = await tx.validationRun.updateMany({ where: { id: jobId, workspaceId, status: "running", processed: i }, data: { processed: { increment: 1 } } });
        if (!claimed.count) return;
        if (c && registered !== null) {
          await deductCreditsInTransaction(tx, workspaceId, CREDIT_COSTS.validateNumber, "VALIDATE");
          await tx.contact.update({ where: { id: c.id }, data: { waStatus: registered ? "ACTIVE" : "INACTIVE" } });
          await tx.validationRun.update({ where: { id: jobId }, data: registered ? { active: { increment: 1 } } : { inactive: { increment: 1 } } });
        } else await tx.validationRun.update({ where: { id: jobId }, data: { unverified: { increment: 1 } } });
      });
    } catch (err) {
      if (err instanceof InsufficientCreditsError) { await stopValidation(jobId, workspaceId); return; }
      throw err;
    }
    await new Promise((r) => setTimeout(r, process.env.NODE_ENV === "test" ? 0 : 2000 + Math.random() * 3000));
  }
  await prisma.$transaction(async (tx) => {
    const current = await tx.validationRun.findUniqueOrThrow({ where: { id: jobId } });
    if (current.status !== "running") return;
    if (current.processed >= current.total) await tx.validationRun.update({ where: { id: jobId }, data: { status: "done" } });
    else await enqueue(tx, "VALIDATION", jobId, workspaceId, { id: jobId, accountId, targetIds: contactIds });
  });
}

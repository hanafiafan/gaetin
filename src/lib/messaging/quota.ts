import { prisma } from "@/lib/db/prisma";
import { getWorkspacePlan } from "@/lib/plans/limits";

export class DailyMessagingQuotaError extends Error {
  constructor(public limit: number) {
    super(`Kuota pengiriman hari ini sudah habis (${limit} pesan).`);
    this.name = "DailyMessagingQuotaError";
  }
}

export function dayStart(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function nextDayStart(date = new Date()): Date {
  const next = dayStart(date);
  next.setDate(next.getDate() + 1);
  return next;
}

export async function getDailyMessagingUsage(workspaceId: string, date = new Date()): Promise<number> {
  const start = dayStart(date);
  const [campaignSent, blastSent, followUpSent] = await Promise.all([
    prisma.campaignMessage.count({
      where: {
        status: { in: ["SENT", "DELIVERED", "READ"] },
        sentAt: { gte: start },
        campaign: { workspaceId },
      },
    }),
    prisma.blastMessage.count({
      where: {
        status: { in: ["SENT", "DELIVERED", "READ"] },
        sentAt: { gte: start },
        blast: { workspaceId },
      },
    }),
    prisma.followUpSchedule.count({
      where: {
        status: "SENT",
        sentAt: { gte: start },
        rule: { workspaceId },
      },
    }),
  ]);
  return campaignSent + blastSent + followUpSent;
}

export async function getDailyMessagingQuota(workspaceId: string) {
  const plan = await getWorkspacePlan(workspaceId);
  const limit = plan.limits.campaignDailyLimit;
  const used = await getDailyMessagingUsage(workspaceId);
  return {
    planName: plan.name,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    resetAt: nextDayStart().toISOString(),
  };
}

export async function assertDailyMessagingQuota(workspaceId: string): Promise<void> {
  const quota = await getDailyMessagingQuota(workspaceId);
  if (quota.remaining <= 0) throw new DailyMessagingQuotaError(quota.limit);
}

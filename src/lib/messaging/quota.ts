import { prisma } from "@/lib/db/prisma";
import { getWorkspacePlan } from "@/lib/plans/limits";

export class DailyMessagingQuotaError extends Error {
  constructor(public limit: number) {
    super(`Kuota pengiriman hari ini sudah habis (${limit} pesan).`);
    this.name = "DailyMessagingQuotaError";
  }
}

// Billing day is Asia/Jakarta (UTC+7), independent of the app/worker host timezone.
export function dayStart(date = new Date()): Date {
  const day = 86_400_000, offset = 7 * 3_600_000;
  return new Date(Math.floor((date.getTime() + offset) / day) * day - offset);
}
export function nextDayStart(date = new Date()): Date {
  return new Date(dayStart(date).getTime() + 86_400_000);
}

export async function getDailyMessagingUsage(workspaceId: string, date = new Date()): Promise<number> {
  const start = dayStart(date);
  return prisma.outboundDelivery.count({ where: {
    workspaceId, channel: "WHATSAPP", status: { not: "FAILED" }, createdAt: { gte: start },
  } });
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

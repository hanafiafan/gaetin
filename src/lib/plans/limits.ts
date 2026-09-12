import { prisma } from "@/lib/db/prisma";
import { getEffectivePlan, type EffectivePlan } from "@/lib/plans-store";
import { getEffectivePlanId, getEffectiveStatus, type PlanId } from "@/config/plans";

export function monthStart(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getWorkspacePlan(workspaceId: string): Promise<EffectivePlan> {
  const subscription = await prisma.subscription.findUnique({
    where: { workspaceId },
    select: { plan: true, status: true, trialEndsAt: true, currentPeriodEnd: true },
  });
  const status = getEffectiveStatus(subscription?.status ?? "TRIAL_EXPIRED", { trialEndsAt: subscription?.trialEndsAt, currentPeriodEnd: subscription?.currentPeriodEnd });
  return getEffectivePlan(getEffectivePlanId((subscription?.plan ?? "STARTER") as PlanId, status));
}

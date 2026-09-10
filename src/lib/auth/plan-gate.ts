import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PLANS, getEffectivePlanId, getEffectiveStatus, type PlanId, type PlanFeatures } from "@/config/plans";

export async function requirePlanFeature(feature: keyof PlanFeatures) {
  const session = await requireSession();
  const workspace = await prisma.workspace.findUnique({
    where: { id: session.workspace.id },
    select: {
      subscription: { select: { plan: true, status: true, trialEndsAt: true, currentPeriodEnd: true } },
    },
  });

  const sub = workspace?.subscription;
  const planId = (sub?.plan ?? "STARTER") as PlanId;
  const status = getEffectiveStatus(sub?.status ?? "TRIAL", {
    trialEndsAt: sub?.trialEndsAt,
    currentPeriodEnd: sub?.currentPeriodEnd,
  });
  const effectivePlanId = getEffectivePlanId(planId, status);
  const features = PLANS[effectivePlanId]?.features ?? PLANS.STARTER.features;

  if (!features[feature]) {
    redirect("/dashboard/billing?locked=1");
  }
}

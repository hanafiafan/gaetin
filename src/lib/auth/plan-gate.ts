import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PLANS, getEffectivePlanId, type PlanId, type PlanFeatures } from "@/config/plans";

export async function requirePlanFeature(feature: keyof PlanFeatures) {
  const session = await requireSession();
  const workspace = await prisma.workspace.findUnique({
    where: { id: session.workspace.id },
    select: { subscription: { select: { plan: true, status: true } } },
  });

  const planId = (workspace?.subscription?.plan ?? "STARTER") as PlanId;
  const status = workspace?.subscription?.status ?? "TRIAL";
  const effectivePlanId = getEffectivePlanId(planId, status);
  const features = PLANS[effectivePlanId]?.features ?? PLANS.STARTER.features;

  if (!features[feature]) {
    redirect("/dashboard/billing?locked=1");
  }
}

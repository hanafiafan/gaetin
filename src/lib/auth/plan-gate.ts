import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PLANS, type PlanId, type PlanFeatures } from "@/config/plans";

export async function requirePlanFeature(feature: keyof PlanFeatures) {
  const session = await requireSession();
  const workspace = await prisma.workspace.findUnique({
    where: { id: session.workspace.id },
    select: { subscription: { select: { plan: true, status: true } } },
  });

  const planId = (workspace?.subscription?.plan ?? "STARTER") as PlanId;
  const status = workspace?.subscription?.status ?? "TRIAL";
  // Trial/expired users are always restricted to STARTER features
  const effectivePlanId =
    status === "TRIAL" || status === "TRIAL_EXPIRED" ? "STARTER" : planId;
  const features = PLANS[effectivePlanId]?.features ?? PLANS.STARTER.features;

  if (!features[feature]) {
    redirect("/dashboard/billing?locked=1");
  }
}

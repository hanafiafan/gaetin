import { PLANS, type PlanFeatures } from "@/config/plans";
import { getWorkspacePlan } from "@/lib/plans/limits";
import { fail } from "@/lib/api";
export async function featureDenied(workspaceId: string, feature: keyof PlanFeatures) {
  const plan = await getWorkspacePlan(workspaceId);
  return PLANS[plan.id].features[feature] ? null : fail("PLAN_FEATURE", "Fitur ini memerlukan paket aktif yang mendukungnya.", 403);
}

import { prisma } from "@/lib/db/prisma";
import { PLANS, TOPUP_PACKS, YEARLY_DISCOUNT, type PlanId, type BillingCycle, type PlanLimits, type TopupPack } from "@/config/plans";

export interface EffectivePlan {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  monthlyCredits: number;
  limits: PlanLimits;
}

export interface EffectivePlans {
  plans: EffectivePlan[];
  topupPacks: TopupPack[];
  yearlyDiscount: number;
}

interface PlansOverride {
  plans?: Partial<Record<PlanId, Partial<Pick<EffectivePlan, "name" | "monthlyPrice" | "monthlyCredits">> & { limits?: Partial<PlanLimits> }>>;
  topupPacks?: TopupPack[];
  yearlyDiscount?: number;
}

const ORDER: PlanId[] = ["STARTER", "GROWTH", "PRO"];

/** Plan efektif = default kode di-override oleh setelan DB (key "plans"). */
export async function getEffectivePlans(): Promise<EffectivePlans> {
  const row = await prisma.siteSetting.findUnique({ where: { key: "plans" } });
  const ov = (row?.value as PlansOverride | null) ?? {};

  const plans = ORDER.map((id) => {
    const base = PLANS[id];
    const o = ov.plans?.[id] ?? {};
    return {
      id,
      name: o.name ?? base.name,
      monthlyPrice: o.monthlyPrice ?? base.monthlyPrice,
      monthlyCredits: o.monthlyCredits ?? base.monthlyCredits,
      limits: { ...base.limits, ...(o.limits ?? {}) },
    };
  });

  return {
    plans,
    topupPacks: ov.topupPacks ?? TOPUP_PACKS,
    yearlyDiscount: ov.yearlyDiscount ?? YEARLY_DISCOUNT,
  };
}

export async function setPlansOverride(data: PlansOverride): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: "plans" },
    update: { value: data as object },
    create: { key: "plans", value: data as object },
  });
}

export function calcPrice(monthlyPrice: number, cycle: BillingCycle, yearlyDiscount: number): number {
  if (cycle === "MONTHLY") return monthlyPrice;
  return Math.round(monthlyPrice * 12 * (1 - yearlyDiscount));
}

/** Cari plan efektif by id. */
export async function getEffectivePlan(id: PlanId): Promise<EffectivePlan> {
  const { plans } = await getEffectivePlans();
  return plans.find((p) => p.id === id) ?? plans[0];
}

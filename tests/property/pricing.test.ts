import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { calculatePrice, PLANS, YEARLY_DISCOUNT, TOPUP_PACKS } from "@/config/plans";

const PLAN_IDS = ["STARTER", "GROWTH", "PRO"] as const;
const PAID_PLAN_IDS = ["GROWTH", "PRO"] as const;

describe("pricing (property-based)", () => {
  it("harga tahunan tidak pernah lebih mahal dari 12x bulanan", () => {
    fc.assert(
      fc.property(fc.constantFrom(...PLAN_IDS), (plan) => {
        const monthly = calculatePrice(plan, "MONTHLY");
        const yearly = calculatePrice(plan, "YEARLY");
        return yearly <= monthly * 12;
      }),
    );
  });

  it("diskon tahunan sesuai konstanta", () => {
    fc.assert(
      fc.property(fc.constantFrom(...PLAN_IDS), (plan) => {
        const monthly = PLANS[plan].monthlyPrice;
        const yearly = calculatePrice(plan, "YEARLY");
        return yearly === Math.round(monthly * 12 * (1 - YEARLY_DISCOUNT));
      }),
    );
  });

  it("harga tidak pernah negatif", () => {
    fc.assert(
      fc.property(fc.constantFrom(...PLAN_IDS), fc.constantFrom("MONTHLY", "YEARLY"), (plan, cycle) => {
        return calculatePrice(plan, cycle as "MONTHLY" | "YEARLY") >= 0;
      }),
    );
  });
});

// Properti model bisnis, bukan sekadar aritmetika: pernah terjadi paket Bisnis
// seharga Rp99,5/kredit sementara top-up 1.000 kredit Rp100/kredit — praktis
// identik, sehingga tidak ada alasan ekonomis untuk berlangganan.
describe("ekonomi paket vs top-up", () => {
  const cheapestTopupPerCredit = Math.min(...TOPUP_PACKS.map((p) => p.price / p.credits));

  it("berlangganan selalu lebih murah per kredit daripada top-up termurah", () => {
    for (const id of PAID_PLAN_IDS) {
      const plan = PLANS[id];
      const perCredit = plan.monthlyPrice / plan.monthlyCredits;
      expect(perCredit).toBeLessThan(cheapestTopupPerCredit);
    }
  });

  it("paket lebih mahal memberi harga per kredit yang lebih baik", () => {
    const growth = PLANS.GROWTH.monthlyPrice / PLANS.GROWTH.monthlyCredits;
    const pro = PLANS.PRO.monthlyPrice / PLANS.PRO.monthlyCredits;
    expect(pro).toBeLessThan(growth);
  });

  it("paket top-up lebih besar memberi harga per kredit yang lebih baik", () => {
    const sorted = [...TOPUP_PACKS].sort((a, b) => a.credits - b.credits);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].price / sorted[i].credits).toBeLessThan(
        sorted[i - 1].price / sorted[i - 1].credits,
      );
    }
  });
});

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { calculatePrice, PLANS, YEARLY_DISCOUNT } from "@/config/plans";

const PLAN_IDS = ["STARTER", "GROWTH", "PRO"] as const;

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

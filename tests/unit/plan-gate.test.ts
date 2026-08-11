import { describe, it, expect } from "vitest";
import { getEffectivePlanId } from "@/config/plans";

describe("getEffectivePlanId", () => {
  it("gives an active trial the real plan's features (limited by credit, not feature)", () => {
    expect(getEffectivePlanId("GROWTH", "TRIAL")).toBe("GROWTH");
  });

  it("drops an expired trial down to Starter", () => {
    expect(getEffectivePlanId("GROWTH", "TRIAL_EXPIRED")).toBe("STARTER");
  });

  it("leaves a paying subscriber's plan untouched", () => {
    expect(getEffectivePlanId("PRO", "ACTIVE")).toBe("PRO");
  });
});

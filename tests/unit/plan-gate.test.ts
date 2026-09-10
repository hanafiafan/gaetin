import { describe, it, expect } from "vitest";
import { getEffectivePlanId, getEffectiveStatus } from "@/config/plans";

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

  it("drops a lapsed subscription down to Starter", () => {
    expect(getEffectivePlanId("PRO", "EXPIRED")).toBe("STARTER");
  });

  it("drops blocked and cancelled accounts down to Starter", () => {
    expect(getEffectivePlanId("PRO", "BLOCKED")).toBe("STARTER");
    expect(getEffectivePlanId("PRO", "CANCELLED")).toBe("STARTER");
  });
});

// Tidak ada proses yang pernah menulis TRIAL_EXPIRED/EXPIRED ke kolom status,
// jadi seluruh penegakan kedaluwarsa bergantung pada fungsi ini.
describe("getEffectiveStatus", () => {
  const now = new Date("2026-06-15T00:00:00Z");
  const past = new Date("2026-06-01T00:00:00Z");
  const future = new Date("2026-07-01T00:00:00Z");

  it("expires a trial whose end date has passed", () => {
    expect(getEffectiveStatus("TRIAL", { trialEndsAt: past }, now)).toBe("TRIAL_EXPIRED");
  });

  it("leaves a trial that is still running", () => {
    expect(getEffectiveStatus("TRIAL", { trialEndsAt: future }, now)).toBe("TRIAL");
  });

  it("expires a subscription past the end of its paid period", () => {
    expect(getEffectiveStatus("ACTIVE", { currentPeriodEnd: past }, now)).toBe("EXPIRED");
  });

  it("leaves a subscription inside its paid period", () => {
    expect(getEffectiveStatus("ACTIVE", { currentPeriodEnd: future }, now)).toBe("ACTIVE");
  });

  it("leaves status untouched when the relevant date is missing", () => {
    expect(getEffectiveStatus("TRIAL", {}, now)).toBe("TRIAL");
    expect(getEffectiveStatus("ACTIVE", { trialEndsAt: past }, now)).toBe("ACTIVE");
  });

  it("does not resurrect a status that is already terminal", () => {
    expect(getEffectiveStatus("CANCELLED", { currentPeriodEnd: future }, now)).toBe("CANCELLED");
  });
});

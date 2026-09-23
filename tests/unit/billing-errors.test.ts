import { describe, expect, it } from "vitest";
import { billingErrorMessage } from "@/lib/billing/errors";

describe("billingErrorMessage", () => {
  it("translates internal Midtrans and catalog errors", () => {
    expect(billingErrorMessage(new Error("MIDTRANS_NOT_CONFIGURED"), "fallback")).toContain("belum dikonfigurasi");
    expect(billingErrorMessage(new Error("PACK_NOT_FOUND"), "fallback")).toContain("kredit tidak ditemukan");
    expect(billingErrorMessage(new Error("PLAN_NOT_FOUND"), "fallback")).toContain("langganan tidak ditemukan");
  });

  it("preserves useful business errors and falls back for unknown values", () => {
    expect(billingErrorMessage(new Error("Paket aktif belum berakhir"), "fallback")).toBe("Paket aktif belum berakhir");
    expect(billingErrorMessage(null, "fallback")).toBe("fallback");
  });
});

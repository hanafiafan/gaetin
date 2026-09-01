import { describe, it, expect } from "vitest";
import { normalizePhone, isValidPhone } from "@/lib/utils";

describe("normalizePhone", () => {
  it("nomor lokal berawalan 0 di-fallback ke kode negara default (62)", () => {
    expect(normalizePhone("0812-3456-7890")).toBe("6281234567890");
  });

  it("nomor internasional dengan + dibiarkan apa adanya (tidak dipaksa jadi 62)", () => {
    expect(normalizePhone("+1 555-123-4567")).toBe("15551234567");
  });

  it("nomor tanpa 0/+ tidak diubah (tidak lagi dipaksa asumsi Indonesia dari angka 8)", () => {
    expect(normalizePhone("85512345678")).toBe("85512345678");
  });
});

describe("isValidPhone", () => {
  it("menerima 8-15 digit, opsional diawali +", () => {
    expect(isValidPhone("+15551234567")).toBe(true);
    expect(isValidPhone("6281234567890")).toBe(true);
  });

  it("menolak yang terlalu pendek", () => {
    expect(isValidPhone("12345")).toBe(false);
  });
});

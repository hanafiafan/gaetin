import { describe, it, expect } from "vitest";
import { effectiveDailyLimit, isWarmingUp, warmupDaysLeft, WARMUP_LADDER } from "@/lib/messaging/warmup";

describe("pemanasan nomor", () => {
  it("nomor yang belum pernah mengirim dapat jatah hari pertama", () => {
    expect(effectiveDailyLimit({ dailyLimit: 100, warmupDay: 0 })).toBe(20);
    expect(effectiveDailyLimit({ dailyLimit: 100, warmupDay: 1 })).toBe(20);
  });

  it("jatahnya naik tiap hari aktif", () => {
    const naik = [1, 2, 3, 4, 5].map((d) => effectiveDailyLimit({ dailyLimit: 1000, warmupDay: d }));
    expect(naik).toEqual([20, 30, 45, 65, 90]);
    expect(naik).toEqual([...naik].sort((a, b) => a - b));
  });

  it("setelah tangga habis, batas penuh yang berlaku", () => {
    const sesudah = WARMUP_LADDER.length + 1;
    expect(effectiveDailyLimit({ dailyLimit: 500, warmupDay: sesudah })).toBe(500);
    expect(isWarmingUp({ dailyLimit: 500, warmupDay: sesudah })).toBe(false);
  });

  it("tangga tidak pernah menaikkan batas di atas batas penuh nomornya", () => {
    // Admin menyetel batas 10; pemanasan hanya boleh memperlambat.
    for (const hari of [0, 1, 5, 20]) {
      expect(effectiveDailyLimit({ dailyLimit: 10, warmupDay: hari })).toBe(10);
    }
  });

  it("batas penuh yang kecil berarti tidak ada masa pemanasan", () => {
    expect(isWarmingUp({ dailyLimit: 10, warmupDay: 1 })).toBe(false);
    expect(isWarmingUp({ dailyLimit: 100, warmupDay: 1 })).toBe(true);
  });

  it("menghitung sisa hari sampai batas penuh", () => {
    expect(warmupDaysLeft({ dailyLimit: 1000, warmupDay: 1 })).toBe(WARMUP_LADDER.length);
    expect(warmupDaysLeft({ dailyLimit: 1000, warmupDay: WARMUP_LADDER.length })).toBe(1);
    expect(warmupDaysLeft({ dailyLimit: 1000, warmupDay: 99 })).toBe(0);
  });
});

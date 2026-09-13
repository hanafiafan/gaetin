import { describe, it, expect } from "vitest";
import { hariPemanasanAwal, profilUmur, PROFIL_UMUR, UMUR_NOMOR } from "@/lib/messaging/account-age";
import { effectiveDailyLimit, WARMUP_LADDER } from "@/lib/messaging/warmup";

describe("umur nomor", () => {
  it("makin tua nomornya, makin tinggi titik mulainya", () => {
    const mulai = UMUR_NOMOR.map((u) => PROFIL_UMUR[u].mulaiHari);
    expect(mulai).toEqual([...mulai].sort((a, b) => a - b));
    expect(new Set(mulai).size).toBe(mulai.length);
  });

  it("nomor baru mulai dari anak tangga paling awal", () => {
    expect(effectiveDailyLimit({ dailyLimit: 300, warmupDay: hariPemanasanAwal("BARU") })).toBe(20);
  });

  it("nomor di atas satu tahun melewati seluruh masa pemanasan", () => {
    const hari = hariPemanasanAwal("SETAHUN");
    expect(hari).toBeGreaterThan(WARMUP_LADDER.length);
    expect(effectiveDailyLimit({ dailyLimit: 300, warmupDay: hari })).toBe(300);
  });

  it("umur menengah tetap memanas, cuma mulainya lebih tinggi", () => {
    const sebulan = effectiveDailyLimit({ dailyLimit: 300, warmupDay: hariPemanasanAwal("SEBULAN") });
    expect(sebulan).toBe(65);
    expect(sebulan).toBeLessThan(300);
  });

  it("umur yang tidak dikenal diperlakukan sebagai nomor baru", () => {
    // Nilai lama di database atau kiriman yang aneh tidak boleh memberi
    // keringanan; jatuh ke pilihan paling hati-hati.
    expect(profilUmur("ENTAH_APA").mulaiHari).toBe(PROFIL_UMUR.BARU.mulaiHari);
    expect(profilUmur("").mulaiHari).toBe(PROFIL_UMUR.BARU.mulaiHari);
  });

  it("batas yang disarankan naik seiring umur", () => {
    const batas = UMUR_NOMOR.map((u) => PROFIL_UMUR[u].batasDisarankan);
    expect(batas).toEqual([...batas].sort((a, b) => a - b));
  });
});

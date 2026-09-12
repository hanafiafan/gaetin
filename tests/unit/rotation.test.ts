import { describe, it, expect } from "vitest";
import { pilihNomorPalingLonggar, sisaJatah, type KandidatNomor } from "@/lib/messaging/rotation";

const hariIni = new Date("2026-09-13T00:00:00Z");
const nomor = (id: string, p: Partial<KandidatNomor> = {}): KandidatNomor => ({
  id,
  dailyLimit: 250,
  warmupDay: 11, // sudah lewat masa pemanasan
  sentToday: 0,
  sentTodayResetAt: hariIni,
  ...p,
});

describe("sisa jatah nomor", () => {
  it("penghitung dari hari kemarin dianggap nol", () => {
    const kemarin = new Date(hariIni.getTime() - 86_400_000);
    expect(sisaJatah(nomor("a", { sentToday: 200, sentTodayResetAt: kemarin }), hariIni)).toBe(250);
  });

  it("nomor yang masih memanas memakai jatah tangganya, bukan batas penuh", () => {
    expect(sisaJatah(nomor("a", { warmupDay: 1 }), hariIni)).toBe(20);
  });

  it("tidak pernah negatif", () => {
    expect(sisaJatah(nomor("a", { sentToday: 999 }), hariIni)).toBe(0);
  });
});

describe("memilih nomor pengirim", () => {
  it("memilih yang persentase pemakaiannya paling kecil", () => {
    const pilihan = pilihNomorPalingLonggar(
      [nomor("a", { sentToday: 100 }), nomor("b", { sentToday: 10 }), nomor("c", { sentToday: 50 })],
      hariIni,
    );
    expect(pilihan).toBe("b");
  });

  it("mengukur dengan persentase, bukan jumlah pesan", () => {
    // "kecil" baru memanas (jatah 20, terpakai 10 = 50%);
    // "besar" matang (jatah 250, terpakai 60 = 24%) — meski jumlahnya lebih banyak.
    const pilihan = pilihNomorPalingLonggar(
      [nomor("kecil", { warmupDay: 1, sentToday: 10 }), nomor("besar", { sentToday: 60 })],
      hariIni,
    );
    expect(pilihan).toBe("besar");
  });

  it("melewati nomor yang jatahnya sudah habis", () => {
    const pilihan = pilihNomorPalingLonggar([nomor("penuh", { sentToday: 250 }), nomor("sisa", { sentToday: 249 })], hariIni);
    expect(pilihan).toBe("sisa");
  });

  it("mengembalikan null kalau semua nomor penuh", () => {
    expect(pilihNomorPalingLonggar([nomor("a", { sentToday: 250 }), nomor("b", { sentToday: 250 })], hariIni)).toBeNull();
    expect(pilihNomorPalingLonggar([], hariIni)).toBeNull();
  });

  it("membagi rata saat semua nomor sama kondisinya", () => {
    // Simulasi sepuluh pesan berturut-turut ke tiga nomor identik.
    const akun = [nomor("a"), nomor("b"), nomor("c")];
    const terpakai: Record<string, number> = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < 9; i++) {
      const dipilih = pilihNomorPalingLonggar(akun, hariIni)!;
      terpakai[dipilih] += 1;
      akun.find((x) => x.id === dipilih)!.sentToday += 1;
    }
    expect(Object.values(terpakai)).toEqual([3, 3, 3]);
  });
});

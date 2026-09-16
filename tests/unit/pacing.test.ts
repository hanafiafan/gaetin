import { describe, it, expect } from "vitest";
import {
  akhirJendelaHariIni,
  alasanBerhenti,
  dalamJamKirim,
  jamWib,
  jedaPesanMs,
  jendelaBerikutnya,
  perkiraanSelesai,
  JEDA_MAKS_MS,
  JEDA_MIN_MS,
} from "@/lib/messaging/pacing";

/** Waktu WIB -> Date, supaya tesnya tidak bergantung zona waktu mesin. */
const wib = (iso: string) => new Date(`${iso}+07:00`);

describe("jam kirim", () => {
  it("membaca jam WIB, bukan jam server", () => {
    expect(jamWib(wib("2026-09-13T09:30:00"))).toBe(9);
    expect(jamWib(wib("2026-09-13T23:59:00"))).toBe(23);
  });

  it("hanya jam 08.00-19.59 yang dianggap jam kirim", () => {
    expect(dalamJamKirim(wib("2026-09-13T07:59:00"))).toBe(false);
    expect(dalamJamKirim(wib("2026-09-13T08:00:00"))).toBe(true);
    expect(dalamJamKirim(wib("2026-09-13T19:59:00"))).toBe(true);
    expect(dalamJamKirim(wib("2026-09-13T20:00:00"))).toBe(false);
    expect(dalamJamKirim(wib("2026-09-13T02:00:00"))).toBe(false);
  });

  it("dini hari menunggu pagi ini, malam menunggu besok pagi", () => {
    expect(jendelaBerikutnya(wib("2026-09-13T02:00:00")).toISOString()).toBe(wib("2026-09-13T08:00:00").toISOString());
    expect(jendelaBerikutnya(wib("2026-09-13T21:00:00")).toISOString()).toBe(wib("2026-09-14T08:00:00").toISOString());
  });

  it("jendela hari ini tutup jam 20.00 WIB", () => {
    expect(akhirJendelaHariIni(wib("2026-09-13T09:00:00")).toISOString()).toBe(wib("2026-09-13T20:00:00").toISOString());
  });
});

describe("jeda antar pesan", () => {
  it("menyebar sisa jatah ke sisa jam kirim", () => {
    // 09.00 WIB, tersisa 11 jam, jatah 200 belum terpakai -> sekitar 3,3 menit.
    const jeda = jedaPesanMs({ jatahHarian: 200, sudahTerkirim: 0 }, wib("2026-09-13T09:00:00"), () => 0.5);
    expect(jeda).toBeGreaterThan(3 * 60_000);
    expect(jeda).toBeLessThan(4 * 60_000);
  });

  it("makin sedikit sisa waktu, makin rapat", () => {
    const pagi = jedaPesanMs({ jatahHarian: 200, sudahTerkirim: 0 }, wib("2026-09-13T09:00:00"), () => 0.5);
    const sore = jedaPesanMs({ jatahHarian: 200, sudahTerkirim: 100 }, wib("2026-09-13T17:00:00"), () => 0.5);
    expect(sore).toBeLessThan(pagi);
  });

  it("tidak pernah lebih cepat dari batas bawah, walau jatahnya besar", () => {
    const jeda = jedaPesanMs({ jatahHarian: 5000, sudahTerkirim: 0 }, wib("2026-09-13T19:55:00"), () => 0.5);
    expect(jeda).toBeGreaterThanOrEqual(JEDA_MIN_MS);
  });

  it("tidak pernah lebih lambat dari batas atas, walau jatahnya kecil", () => {
    const jeda = jedaPesanMs({ jatahHarian: 1, sudahTerkirim: 0 }, wib("2026-09-13T08:00:00"), () => 1);
    expect(jeda).toBeLessThanOrEqual(JEDA_MAKS_MS);
  });

  it("diacak, jadi jaraknya tidak pernah persis sama", () => {
    const rendah = jedaPesanMs({ jatahHarian: 100, sudahTerkirim: 0 }, wib("2026-09-13T09:00:00"), () => 0);
    const tinggi = jedaPesanMs({ jatahHarian: 100, sudahTerkirim: 0 }, wib("2026-09-13T09:00:00"), () => 1);
    expect(tinggi).toBeGreaterThan(rendah);
  });
});

describe("rem otomatis", () => {
  const gagal = (n: number) => Array.from({ length: n }, () => ({ status: "FAILED" }));
  const sukses = (n: number) => Array.from({ length: n }, () => ({ status: "SENT" }));

  it("diam saja kalau semuanya lancar", () => {
    expect(alasanBerhenti(sukses(20))).toBeNull();
    expect(alasanBerhenti([])).toBeNull();
  });

  it("berhenti setelah lima gagal berturut-turut", () => {
    expect(alasanBerhenti([...gagal(4), ...sukses(16)])).toBeNull();
    expect(alasanBerhenti([...gagal(5), ...sukses(15)])).toMatch(/berturut-turut/);
  });

  it("berhenti kalau lebih dari seperlima pesan terakhir gagal", () => {
    // 5 gagal tersebar di antara 15 sukses: tidak beruntun, tapi rasionya 25%.
    const campur = [{ status: "SENT" }, ...gagal(1), ...sukses(3), ...gagal(1), ...sukses(3), ...gagal(1), ...sukses(3), ...gagal(1), ...sukses(2), ...gagal(1)];
    expect(alasanBerhenti(campur)).toMatch(/dibatasi WhatsApp/);
  });

  it("tidak menghakimi dari sampel kecil", () => {
    // 1 gagal dari 2 = 50%, tapi dua pesan belum bisa disebut pola.
    expect(alasanBerhenti([{ status: "FAILED" }, { status: "SENT" }])).toBeNull();
  });
});

describe("perkiraan selesai", () => {
  it("tidak memberi perkiraan kalau tidak ada jatah sama sekali", () => {
    expect(perkiraanSelesai(50, 0, 0, wib("2026-09-14T10:00:00"))).toBeNull();
  });

  it("yang muat hari ini selesai sebelum jam tutup", () => {
    const hasil = perkiraanSelesai(20, 100, 100, wib("2026-09-14T10:00:00"));
    expect(hasil).not.toBeNull();
    expect(hasil!.getTime()).toBeGreaterThan(wib("2026-09-14T10:00:00").getTime());
    expect(hasil!.getTime()).toBeLessThanOrEqual(akhirJendelaHariIni(wib("2026-09-14T10:00:00")).getTime());
  });

  it("yang melebihi jatah harian tumpah ke hari-hari berikutnya", () => {
    // 500 pesan, jatah 100/hari, hari ini masih 100: hari ini + 4 hari lagi.
    const hasil = perkiraanSelesai(500, 100, 100, wib("2026-09-14T09:00:00"));
    expect(hasil).not.toBeNull();
    expect(hasil!.getTime()).toBeGreaterThan(wib("2026-09-18T08:00:00").getTime());
    expect(hasil!.getTime()).toBeLessThanOrEqual(wib("2026-09-18T20:00:00").getTime());
  });

  it("di luar jam kirim hitungannya mulai dari jendela berikutnya", () => {
    const malam = wib("2026-09-14T22:00:00");
    const hasil = perkiraanSelesai(50, 100, 100, malam);
    expect(hasil!.getTime()).toBeGreaterThanOrEqual(jendelaBerikutnya(malam).getTime());
  });

  it("tidak ada sisa berarti sudah selesai", () => {
    const now = wib("2026-09-14T10:00:00");
    expect(perkiraanSelesai(0, 100, 100, now)!.getTime()).toBe(now.getTime());
  });
});

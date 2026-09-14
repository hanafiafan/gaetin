import { describe, it, expect } from "vitest";
import {
  buatTokenReset,
  hashSama,
  hashToken,
  MASA_BERLAKU_MS,
  tokenMasihBerlaku,
} from "@/lib/auth/password-reset";

describe("token atur ulang password", () => {
  it("tokennya acak, tidak pernah sama dua kali", () => {
    const kumpulan = new Set(Array.from({ length: 50 }, () => buatTokenReset().token));
    expect(kumpulan.size).toBe(50);
  });

  it("token mentahnya tidak ikut tersimpan", () => {
    const { token, tokenHash } = buatTokenReset();
    expect(tokenHash).not.toContain(token);
    expect(tokenHash).toBe(hashToken(token));
    expect(tokenHash).toHaveLength(64); // sha256 heksadesimal
  });

  it("berlaku satu jam", () => {
    const { expiresAt } = buatTokenReset();
    const selisih = expiresAt.getTime() - Date.now();
    expect(selisih).toBeGreaterThan(MASA_BERLAKU_MS - 5_000);
    expect(selisih).toBeLessThanOrEqual(MASA_BERLAKU_MS);
  });

  it("menolak token yang sudah lewat waktunya", () => {
    const lewat = { expiresAt: new Date(Date.now() - 1000), usedAt: null };
    expect(tokenMasihBerlaku(lewat)).toBe(false);
  });

  it("menolak token yang sudah dipakai, walau belum kedaluwarsa", () => {
    const dipakai = { expiresAt: new Date(Date.now() + 60_000), usedAt: new Date() };
    expect(tokenMasihBerlaku(dipakai)).toBe(false);
  });

  it("menolak token yang tidak ditemukan", () => {
    expect(tokenMasihBerlaku(null)).toBe(false);
  });

  it("menerima token yang masih hidup dan belum dipakai", () => {
    expect(tokenMasihBerlaku({ expiresAt: new Date(Date.now() + 60_000), usedAt: null })).toBe(true);
  });

  it("perbandingan hash tidak meledak untuk panjang yang berbeda", () => {
    expect(hashSama("abc", "abcd")).toBe(false);
    expect(hashSama("", "")).toBe(true);
    const h = hashToken("apa saja");
    expect(hashSama(h, h)).toBe(true);
    expect(hashSama(h, hashToken("yang lain"))).toBe(false);
  });
});

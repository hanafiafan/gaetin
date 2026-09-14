import { createHash, randomBytes, timingSafeEqual } from "crypto";

/**
 * Token untuk tautan "lupa password".
 *
 * Yang dikirim lewat email adalah token mentah; yang disimpan di database
 * hanya hash-nya. Kalau isi tabel itu bocor, tidak ada satu pun tautan yang
 * bisa dipakai orang lain — persis seperti password, yang tidak pernah
 * disimpan apa adanya.
 */

/** Tautan berlaku satu jam. Cukup untuk membuka email, terlalu pendek untuk dicuri diam-diam. */
export const MASA_BERLAKU_MS = 60 * 60 * 1000;

/** Token mentah untuk dikirim ke email, beserta hash untuk disimpan. */
export function buatTokenReset(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + MASA_BERLAKU_MS),
  };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Membandingkan dua hash tanpa membocorkan lewat lama waktu perbandingan.
 *
 * Pencarian di database memang sudah memakai hash, tapi perbandingan apa pun
 * yang menyangkut rahasia sebaiknya tidak berhenti di karakter pertama yang
 * berbeda.
 */
export function hashSama(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export interface TokenTersimpan {
  expiresAt: Date;
  usedAt: Date | null;
}

/** Token masih bisa dipakai? Sekali pakai, dan hanya sebelum kedaluwarsa. */
export function tokenMasihBerlaku(token: TokenTersimpan | null, sekarang = new Date()): boolean {
  if (!token) return false;
  if (token.usedAt) return false;
  return token.expiresAt.getTime() > sekarang.getTime();
}

/** Isi email berisi tautan atur ulang. */
export function emailAturUlang(nama: string, tautan: string): { subject: string; html: string } {
  return {
    subject: "Atur ulang password Hellens",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 16px">Atur ulang password</h2>
        <p style="margin:0 0 12px">Halo ${nama},</p>
        <p style="margin:0 0 20px">Ada permintaan untuk mengatur ulang password akun Anda. Klik tombol di bawah untuk membuat password baru.</p>
        <p style="margin:0 0 24px">
          <a href="${tautan}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">Buat password baru</a>
        </p>
        <p style="margin:0 0 12px;color:#666;font-size:13px">Tautan ini berlaku 1 jam dan hanya bisa dipakai sekali.</p>
        <p style="margin:0;color:#666;font-size:13px">Kalau bukan Anda yang meminta, abaikan saja email ini — password Anda tidak berubah.</p>
      </div>
    `,
  };
}

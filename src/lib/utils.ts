import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Dibaca langsung dari process.env (bukan modul @/lib/env yang tervalidasi ketat)
// karena file ini juga diimpor dari komponen client lewat cn() — modul env melempar
// error kalau var server-only lain belum diisi, yang akan merusak bundle client.
const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || "62";

/**
 * Normalisasi nomor telepon ke format E.164 tanpa tanda +.
 * Nomor yang sudah punya kode negara (dengan/tanpa "+") dibiarkan apa adanya.
 * Hanya nomor lokal berawalan "0" yang di-fallback ke DEFAULT_COUNTRY_CODE — ini
 * heuristik (tidak bisa memastikan negara asal nomor lokal), jadi kalau layanan
 * benar-benar melayani banyak negara dengan nomor lokal format "0...", upgrade
 * berikutnya adalah kode negara per-workspace, bukan satu default global.
 * Contoh: 0812-3456-7890 -> 6281234567890 (default 62)
 */
export function normalizePhone(raw: string): string {
  let p = raw.replace(/[^0-9+]/g, "");
  if (p.startsWith("+")) return p.slice(1);
  if (p.startsWith("0")) p = DEFAULT_COUNTRY_CODE + p.slice(1);
  return p;
}

/** Validasi sederhana: 8-15 digit (boleh diawali +). */
export function isValidPhone(raw: string): boolean {
  return /^\+?\d{8,15}$/.test(raw.replace(/[\s-]/g, ""));
}

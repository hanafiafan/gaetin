import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalisasi nomor telepon ke format E.164 Indonesia tanpa tanda +.
 * Contoh: 0812-3456-7890 -> 6281234567890
 */
export function normalizePhone(raw: string): string {
  let p = raw.replace(/[^0-9+]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("0")) p = "62" + p.slice(1);
  if (p.startsWith("8")) p = "62" + p;
  return p;
}

/** Validasi sederhana: 8-15 digit (boleh diawali +). */
export function isValidPhone(raw: string): boolean {
  return /^\+?\d{8,15}$/.test(raw.replace(/[\s-]/g, ""));
}

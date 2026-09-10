import { timingSafeEqual } from "crypto";

/**
 * Bandingkan dua secret tanpa membocorkan berapa banyak karakter awal yang
 * cocok. `===` pada string keluar di karakter pertama yang berbeda, sehingga
 * waktu responsnya bisa dipakai menebak signature per karakter.
 *
 * File terpisah dari lib/utils.ts karena file itu ikut ter-bundle ke browser,
 * sedangkan modul `crypto` hanya ada di server.
 */
export function secureEqual(received: string, expected: string): boolean {
  // timingSafeEqual melempar bila panjang buffer berbeda, dan panjang itu
  // sendiri bukan rahasia — jadi aman diperiksa lebih dulu.
  if (received.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

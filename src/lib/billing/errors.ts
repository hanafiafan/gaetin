export function billingErrorMessage(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : "";
  if (message === "MIDTRANS_NOT_CONFIGURED") return "Midtrans belum dikonfigurasi. Hubungi administrator sebelum membuat pembayaran.";
  if (message === "PACK_NOT_FOUND") return "Paket kredit tidak ditemukan atau sudah tidak tersedia.";
  if (message === "PLAN_NOT_FOUND") return "Paket langganan tidak ditemukan atau sudah tidak tersedia.";
  return message || fallback;
}

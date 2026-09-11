/**
 * Nama tahap pipeline dan cara mengenali tahap "berhasil".
 *
 * Sengaja dipisah dari pipeline.ts: berkas itu mengimpor Prisma, dan papan CRM
 * adalah komponen klien. Menariknya langsung ke sana akan menyeret Prisma ke
 * bundle browser.
 */

export const DEFAULT_PIPELINE_COLUMNS = [
  { name: "Calon Baru", order: 0, color: "#3b82f6" },
  { name: "Sudah Dihubungi", order: 1, color: "#f59e0b" },
  { name: "Sedang Menawar", order: 2, color: "#8b5cf6" },
  { name: "Jadi Beli", order: 3, color: "#22c55e" },
  { name: "Batal", order: 4, color: "#ef4444" },
];

/**
 * Workspace yang dibuat sebelum perubahan ini masih menyimpan nama kolom
 * berbahasa Inggris. Diterjemahkan saat ditampilkan saja — data milik pengguna
 * tidak diubah diam-diam, dan nama buatan sendiri lewat apa adanya.
 */
export const STAGE_LABEL: Record<string, string> = {
  "Lead Baru": "Calon Baru",
  Dihubungi: "Sudah Dihubungi",
  Negosiasi: "Sedang Menawar",
  "Closed Won": "Jadi Beli",
  "Closed Lost": "Batal",
};

/**
 * Kolom "berhasil" dikenali dari namanya, bukan posisinya, karena nama kolom
 * adalah data milik workspace. Daftar ini harus memuat nama lama maupun baru:
 * kalau pencocokannya meleset, nilai penjualan berhenti ditanyakan saat kartu
 * digeser ke sana — dan pendapatan berhenti tercatat tanpa pesan error.
 */
export function isWonColumn(name: string) {
  return /won|menang|jadi beli|deal/i.test(name);
}

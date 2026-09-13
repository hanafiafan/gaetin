import { WARMUP_LADDER } from "@/lib/messaging/warmup";

/**
 * Umur sebuah nomor WhatsApp, dan apa artinya untuk pemanasan.
 *
 * Sistem tidak bisa mengetahui sendiri sudah berapa lama sebuah nomor dipakai —
 * yang dilihatnya cuma tanggal nomor itu disambungkan ke sini. Padahal nomor
 * yang sudah dipakai bertahun-tahun dan nomor yang dibeli kemarin memulai dari
 * titik risiko yang sangat berbeda. Jadi pemiliknya yang memberi tahu.
 *
 * Umur menentukan DARI MANA pemanasan dimulai, bukan menggantikannya: nomor
 * lama pun tetap naik bertahap, hanya saja mulainya dari anak tangga yang
 * lebih tinggi.
 */

export const UMUR_NOMOR = ["BARU", "SEMINGGU", "SEBULAN", "ENAM_BULAN", "SETAHUN"] as const;
export type UmurNomor = (typeof UMUR_NOMOR)[number];

interface ProfilUmur {
  label: string;
  /** Mulai dari anak tangga pemanasan ke berapa. 0 = dari paling awal. */
  mulaiHari: number;
  /** Batas harian yang disarankan untuk nomor seumur ini. */
  batasDisarankan: number;
  keterangan: string;
}

export const PROFIL_UMUR: Record<UmurNomor, ProfilUmur> = {
  BARU: {
    label: "Kurang dari 1 minggu",
    mulaiHari: 0,
    batasDisarankan: 50,
    keterangan: "Nomor baru paling mudah diblokir. Mulai dari 20 pesan sehari dan naik perlahan.",
  },
  SEMINGGU: {
    label: "Lebih dari 1 minggu",
    mulaiHari: 2,
    batasDisarankan: 100,
    keterangan: "Sudah sedikit dikenal. Mulai dari 30 pesan sehari.",
  },
  SEBULAN: {
    label: "Lebih dari 1 bulan",
    mulaiHari: 4,
    batasDisarankan: 150,
    keterangan: "Riwayat pemakaian sudah cukup. Mulai dari 65 pesan sehari.",
  },
  ENAM_BULAN: {
    label: "Lebih dari 6 bulan",
    mulaiHari: 7,
    batasDisarankan: 250,
    keterangan: "Nomor mapan. Mulai dari 160 pesan sehari.",
  },
  SETAHUN: {
    label: "Lebih dari 1 tahun",
    // Melewati seluruh tangga: langsung memakai batas hariannya.
    mulaiHari: WARMUP_LADDER.length + 1,
    batasDisarankan: 300,
    keterangan: "Nomor lama dan tepercaya. Langsung memakai batas harian penuh.",
  },
};

export function profilUmur(umur: string): ProfilUmur {
  return PROFIL_UMUR[(UMUR_NOMOR as readonly string[]).includes(umur) ? (umur as UmurNomor) : "BARU"];
}

/**
 * Hari pemanasan awal untuk umur tertentu.
 *
 * Dipakai HANYA saat umurnya diubah. Menghitung ulang setiap kali nomor
 * disimpan akan mengembalikan nomor yang sudah memanas lima hari ke titik awal
 * cuma karena pemiliknya mengganti nama nomor itu.
 */
export function hariPemanasanAwal(umur: string): number {
  return profilUmur(umur).mulaiHari;
}

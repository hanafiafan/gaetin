/**
 * Irama pengiriman: jam kirim, jeda antar pesan, dan rem otomatis.
 *
 * Yang membuat sebuah nomor ditandai WhatsApp bukan jumlah pesan hariannya,
 * melainkan POLANYA. Dua ratus pesan yang selesai dalam tujuh belas menit
 * adalah mesin; dua ratus pesan yang tersebar sepanjang hari kerja adalah
 * orang yang sibuk. Jatahnya sama, risikonya tidak.
 */

/** Jam kirim, waktu Indonesia Barat. Di luar ini antrean menunggu, bukan batal. */
export const JAM_MULAI = 8;
export const JAM_SELESAI = 20;

const JAM_MS = 3_600_000;
const HARI_MS = 86_400_000;
const OFFSET_WIB = 7 * JAM_MS;

/** Jam berapa sekarang di WIB (0-23), lepas dari zona waktu server. */
export function jamWib(now = new Date()): number {
  return Math.floor(((now.getTime() + OFFSET_WIB) % HARI_MS) / JAM_MS);
}

export function dalamJamKirim(now = new Date()): boolean {
  const jam = jamWib(now);
  return jam >= JAM_MULAI && jam < JAM_SELESAI;
}

/** Tengah malam WIB untuk hari yang sedang berjalan, dalam waktu server. */
function awalHariWib(now: Date): number {
  return Math.floor((now.getTime() + OFFSET_WIB) / HARI_MS) * HARI_MS - OFFSET_WIB;
}

/** Awal jendela kirim berikutnya — hari ini kalau masih pagi, kalau tidak besok. */
export function jendelaBerikutnya(now = new Date()): Date {
  const mulaiHariIni = awalHariWib(now) + JAM_MULAI * JAM_MS;
  return new Date(jamWib(now) < JAM_MULAI ? mulaiHariIni : mulaiHariIni + HARI_MS);
}

/** Jam tutup jendela hari ini. */
export function akhirJendelaHariIni(now: Date): Date {
  return new Date(awalHariWib(now) + JAM_SELESAI * JAM_MS);
}

/** Jeda paling cepat dan paling lambat, apa pun hasil hitungannya. */
export const JEDA_MIN_MS = 15_000;
export const JEDA_MAKS_MS = 15 * 60_000;

/**
 * Jeda sampai pesan berikutnya: sisa waktu jendela dibagi sisa jatah hari ini,
 * lalu diacak ±40% supaya jaraknya tidak pernah persis sama.
 *
 * Membaginya dengan SISA jatah, bukan jatah penuh, membuatnya mengoreksi diri:
 * kampanye yang baru mulai jam empat sore otomatis mengirim lebih rapat, dan
 * yang mulai pagi menyebar longgar.
 */
export function jedaPesanMs(
  { jatahHarian, sudahTerkirim }: { jatahHarian: number; sudahTerkirim: number },
  now = new Date(),
  acak: () => number = Math.random,
): number {
  const sisaJatah = Math.max(1, jatahHarian - sudahTerkirim);
  const sisaWaktu = Math.max(0, akhirJendelaHariIni(now).getTime() - now.getTime());
  const dasar = sisaWaktu / sisaJatah;
  const berjitter = dasar * (0.6 + acak() * 0.8);
  return Math.min(JEDA_MAKS_MS, Math.max(JEDA_MIN_MS, Math.round(berjitter)));
}

/** Berapa pesan terakhir yang diperiksa untuk menentukan nomor sedang bermasalah. */
export const JENDELA_PERIKSA = 20;
export const GAGAL_BERUNTUN_MAKS = 5;
export const RASIO_GAGAL_MAKS = 0.2;

/**
 * Nomor ini sedang bermasalah?
 *
 * Lonjakan kegagalan adalah peringatan paling awal bahwa sebuah nomor mulai
 * dibatasi — biasanya muncul beberapa jam sebelum blokir penuh. Berhenti satu
 * jam jauh lebih murah daripada kehilangan nomornya.
 *
 * `terbaru` diurutkan dari yang PALING BARU.
 */
export function alasanBerhenti(terbaru: { status: string }[]): string | null {
  const dipakai = terbaru.slice(0, JENDELA_PERIKSA);
  if (dipakai.length === 0) return null;

  let beruntun = 0;
  for (const m of dipakai) {
    if (m.status !== "FAILED") break;
    beruntun += 1;
  }
  if (beruntun >= GAGAL_BERUNTUN_MAKS) {
    return `Dihentikan otomatis: ${beruntun} pesan gagal berturut-turut. Periksa koneksi nomor WhatsApp sebelum melanjutkan.`;
  }

  // Rasio baru dipercaya setelah cukup banyak pesan; 1 gagal dari 2 bukan pola.
  if (dipakai.length >= 10) {
    const gagal = dipakai.filter((m) => m.status === "FAILED").length;
    if (gagal / dipakai.length > RASIO_GAGAL_MAKS) {
      return `Dihentikan otomatis: ${gagal} dari ${dipakai.length} pesan terakhir gagal. Nomor mungkin sedang dibatasi WhatsApp.`;
    }
  }

  return null;
}

/** Berapa hari sebuah kontak "beristirahat" setelah dikirimi pesan massal. */
export const JEDA_KONTAK_HARI = 14;

/**
 * Batas waktu untuk menyaring penerima: kontak yang terakhir dihubungi setelah
 * waktu ini sedang beristirahat dan tidak ikut dikirimi.
 *
 * Orang yang sama masuk tiga blast dalam seminggu adalah cara tercepat membuat
 * dia menekan "Laporkan" — dan laporan adalah jalur tercepat menuju blokir.
 * Ini TIDAK berlaku untuk membalas percakapan; hanya untuk pengiriman massal.
 */
export function batasJedaKontak(now = new Date()): Date {
  return new Date(now.getTime() - JEDA_KONTAK_HARI * 86_400_000);
}

import { prisma } from "@/lib/db/prisma";
import { dayStart } from "@/lib/messaging/quota";
import { effectiveDailyLimit } from "@/lib/messaging/warmup";

/**
 * Memilih nomor pengirim untuk satu pesan.
 *
 * Paket Bisnis memberi jatah 1.000 pesan sehari, tapi satu nomor WhatsApp tidak
 * resmi tidak akan selamat mengirim sebanyak itu — batas amannya sekitar
 * 150-250. Jatah paket hanya masuk akal kalau dibagi ke beberapa nomor, dan
 * sebelum ini pembagian itu tidak ada sama sekali: satu kampanye terikat ke
 * satu nomor sampai selesai.
 */

export interface KandidatNomor {
  id: string;
  dailyLimit: number;
  warmupDay: number;
  sentToday: number;
  sentTodayResetAt: Date | null;
}

/** Sisa jatah nomor ini hari ini, dengan penghitung yang sudah basi dianggap nol. */
export function sisaJatah(akun: KandidatNomor, hariIni = dayStart()): number {
  const terpakai = akun.sentTodayResetAt && akun.sentTodayResetAt >= hariIni ? akun.sentToday : 0;
  return Math.max(0, effectiveDailyLimit(akun) - terpakai);
}

/**
 * Nomor dengan beban paling ringan, diukur sebagai PERSENTASE jatahnya yang
 * sudah terpakai — bukan jumlah pesannya.
 *
 * Mengukur dengan jumlah akan membuat nomor baru yang masih memanas (jatah 20)
 * menerima beban yang sama dengan nomor matang (jatah 250), dan nomor baru itu
 * yang paling cepat kena batasi.
 */
export function pilihNomorPalingLonggar(kandidat: KandidatNomor[], hariIni = dayStart()): string | null {
  const layak = kandidat
    .map((a) => ({ a, sisa: sisaJatah(a, hariIni) }))
    .filter((x) => x.sisa > 0);
  if (layak.length === 0) return null;

  layak.sort((x, y) => {
    const rasioX = 1 - x.sisa / Math.max(1, effectiveDailyLimit(x.a));
    const rasioY = 1 - y.sisa / Math.max(1, effectiveDailyLimit(y.a));
    if (rasioX !== rasioY) return rasioX - rasioY;
    // Seri dipecah dengan id supaya urutannya stabil dan bisa diuji.
    return x.a.id < y.a.id ? -1 : 1;
  });
  return layak[0].a.id;
}

/**
 * Total sisa jatah seluruh nomor tersambung di workspace ini.
 *
 * Dipakai untuk menghitung jeda. Dengan rotasi, mengukur jeda dari jatah satu
 * nomor akan membuat pengiriman empat kali lebih lambat dari seharusnya kalau
 * ada empat nomor — jatahnya dibagi, tapi jam kirimnya tidak bertambah.
 */
export async function totalSisaJatah(workspaceId: string): Promise<number> {
  const kandidat = await prisma.messagingAccount.findMany({
    where: { workspaceId, status: "CONNECTED" },
    select: { id: true, dailyLimit: true, warmupDay: true, sentToday: true, sentTodayResetAt: true },
  });
  const hariIni = dayStart();
  return kandidat.reduce((jumlah, a) => jumlah + sisaJatah(a, hariIni), 0);
}

/**
 * Nomor yang dipakai untuk satu pesan tertentu.
 *
 * Kalau pesan ini pernah dicoba sebelumnya, nomornya WAJIB sama. Buku besar
 * pengiriman mengunci satu id pengiriman ke satu nomor; memilih nomor berbeda
 * saat mencoba ulang akan ditolak sebagai DELIVERY_CONFLICT — dan percobaan
 * ulang setelah koneksi terputus adalah hal yang normal terjadi di sini.
 */
export async function nomorUntukPesan(
  deliveryId: string,
  workspaceId: string,
  cadangan: string | null,
): Promise<string | null> {
  const sudahAda = await prisma.outboundDelivery.findUnique({
    where: { id: deliveryId },
    select: { accountId: true },
  });
  if (sudahAda?.accountId) return sudahAda.accountId;

  const kandidat = await prisma.messagingAccount.findMany({
    where: { workspaceId, status: "CONNECTED" },
    select: { id: true, dailyLimit: true, warmupDay: true, sentToday: true, sentTodayResetAt: true },
  });

  const pilihan = pilihNomorPalingLonggar(kandidat);
  // Kalau semua nomor sudah penuh, kembalikan nomor cadangan supaya penolakan
  // datang dari pemeriksaan kuota yang sudah ada — lengkap dengan pesannya —
  // bukan dari sini sebagai "nomor tidak ditemukan".
  return pilihan ?? cadangan;
}

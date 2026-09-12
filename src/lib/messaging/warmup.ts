/**
 * Pemanasan nomor baru.
 *
 * Nomor WhatsApp yang baru disambungkan lalu langsung mengirim ratusan pesan
 * adalah pola yang paling cepat dikenali sebagai robot. Batas harian yang
 * tersimpan di `dailyLimit` adalah tujuan akhir, bukan izin untuk hari
 * pertama — jadi sebuah nomor menaiki tangga di bawah ini dulu.
 *
 * Angkanya dihitung per HARI AKTIF MENGIRIM, bukan per hari kalender sejak
 * disambungkan: nomor yang menganggur seminggu tidak menjadi lebih tepercaya
 * di mata WhatsApp, jadi ia tidak boleh ikut naik tangga selama menganggur.
 */

/** Batas pesan untuk hari aktif ke-1, ke-2, dan seterusnya. */
export const WARMUP_LADDER = [20, 30, 45, 65, 90, 120, 160, 210, 280, 360];

export interface WarmupState {
  /** Batas harian penuh yang dituju, disetel per nomor. */
  dailyLimit: number;
  /** Sudah berapa hari aktif nomor ini mengirim. 0 = belum pernah. */
  warmupDay: number;
}

/**
 * Batas yang benar-benar berlaku hari ini: yang lebih kecil antara tangga
 * pemanasan dan batas penuh nomornya.
 *
 * Nomor yang sudah melewati seluruh tangga memakai batas penuhnya. Batas penuh
 * yang lebih kecil dari tangga (mis. admin menyetel 10) tetap menang — tangga
 * ini hanya boleh memperlambat, tidak pernah mempercepat.
 */
export function effectiveDailyLimit({ dailyLimit, warmupDay }: WarmupState): number {
  const hari = Math.max(1, warmupDay);
  const tangga = WARMUP_LADDER[hari - 1];
  return tangga === undefined ? dailyLimit : Math.min(dailyLimit, tangga);
}

/** Nomor ini masih dalam masa pemanasan? */
export function isWarmingUp(state: WarmupState): boolean {
  return Math.max(1, state.warmupDay) <= WARMUP_LADDER.length && effectiveDailyLimit(state) < state.dailyLimit;
}

/** Sisa hari sampai batas penuh berlaku, untuk ditampilkan ke pengguna. */
export function warmupDaysLeft({ warmupDay }: WarmupState): number {
  return Math.max(0, WARMUP_LADDER.length - Math.max(1, warmupDay) + 1);
}

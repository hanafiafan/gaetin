// Katalog paket langganan & kredit. Sumber kebenaran tunggal untuk harga,
// jatah kredit bulanan, paket top-up, dan biaya kredit per aksi.

export type PlanId = "STARTER" | "GROWTH" | "PRO";
export type BillingCycle = "MONTHLY" | "YEARLY";

export interface PlanFeatures {
  scraper: boolean;
  csvExport: boolean;      // export CSV / Excel
  waValidation: boolean;
  blast: boolean;
  emailBlast: boolean;
  campaigns: boolean;
  crmPipeline: boolean;
  autoFollowUp: boolean;
  inbox: boolean;
  whiteLabel: boolean;
  prioritySupport: boolean;
}

export interface PlanLimits {
  scraperJobsPerMonth: number;
  scraperMaxResultsPerJob: number;
  saveLeadBatchLimit: number;
  campaignDailyLimit: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  monthlyPrice: number; // IDR
  monthlyCredits: number; // jatah kredit per bulan
  contactQuota: number | null; // null = tak dibatasi (kini dibatasi kredit)
  features: PlanFeatures;
  limits: PlanLimits;
}

const ALL_FEATURES: PlanFeatures = {
  scraper: true,
  csvExport: true,
  waValidation: true,
  blast: true,
  emailBlast: true,
  campaigns: true,
  crmPipeline: true,
  autoFollowUp: true,
  inbox: true,
  whiteLabel: false,
  prioritySupport: false,
};

export const PLANS: Record<PlanId, Plan> = {
  STARTER: {
    id: "STARTER",
    name: "Starter",
    monthlyPrice: 0,
    monthlyCredits: 100,
    contactQuota: null,
    // Trial: scraping + CSV export only — upgrade for WhatsApp & CRM
    features: {
      scraper: true,
      csvExport: true,
      waValidation: false,
      blast: false,
      emailBlast: false,
      campaigns: false,
      crmPipeline: false,
      autoFollowUp: false,
      inbox: false,
      whiteLabel: false,
      prioritySupport: false,
    },
    limits: {
      scraperJobsPerMonth: 20,
      scraperMaxResultsPerJob: 100,
      saveLeadBatchLimit: 100,
      campaignDailyLimit: 100,
    },
  },
  GROWTH: {
    id: "GROWTH",
    name: "Bisnis",
    monthlyPrice: 199_000,
    // Jatah dinaikkan dari 2.000: angka lama disusun saat mengirim pesan tidak
    // memakai kredit. Sebulan wajar (800 lead disimpan + 800 divalidasi +
    // 1.500 pesan + 200 email = 3.300) kini muat dengan sisa ruang, dan harga
    // per kredit jatuh ke ~Rp40 sehingga berlangganan jelas lebih murah
    // daripada top-up (~Rp80-100) — sebelumnya keduanya sama persis.
    monthlyCredits: 5_000,
    contactQuota: null,
    features: { ...ALL_FEATURES },
    limits: {
      scraperJobsPerMonth: 250,
      scraperMaxResultsPerJob: 500,
      saveLeadBatchLimit: 500,
      campaignDailyLimit: 1_000,
    },
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    monthlyPrice: 499_000,
    // 3x jatah Bisnis pada 2,5x harga — diskon volume yang terlihat jelas.
    monthlyCredits: 15_000,
    contactQuota: null,
    features: { ...ALL_FEATURES, whiteLabel: true, prioritySupport: true },
    limits: {
      scraperJobsPerMonth: 1_000,
      scraperMaxResultsPerJob: 1_500,
      saveLeadBatchLimit: 1_000,
      campaignDailyLimit: 5_000,
    },
  },
};

export const YEARLY_DISCOUNT = 0.2; // 20%

/** Harga total satu siklus. Tahunan = bulanan x 12 x 0.8. */
export function calculatePrice(planId: PlanId, cycle: BillingCycle): number {
  const monthly = PLANS[planId].monthlyPrice;
  if (cycle === "MONTHLY") return monthly;
  return Math.round(monthly * 12 * (1 - YEARLY_DISCOUNT));
}

// Paket top-up kredit (beli kapan saja).
export interface TopupPack {
  id: string;
  credits: number;
  price: number; // IDR
}
export const TOPUP_PACKS: TopupPack[] = [
  { id: "credit_1000", credits: 1_000, price: 100_000 },
  { id: "credit_5000", credits: 5_000, price: 450_000 },
  { id: "credit_10000", credits: 10_000, price: 800_000 },
];

// Biaya kredit per aksi.
// Scraping sendiri sengaja gratis: OSM/Overpass tanpa biaya, dan mode
// Google Places memakai API key pelanggan (BYOK) sehingga mereka sudah
// membayar ke Google langsung — kredit baru dipotong saat lead disimpan.
export const CREDIT_COSTS = {
  saveLead: 1, // per lead disimpan jadi kontak
  validateNumber: 1, // per nomor divalidasi
  sendWhatsApp: 1, // per pesan WhatsApp terkirim (kampanye & blast)
  sendEmail: 1, // per email terkirim (email blast)
  findEmail: 2, // per email yang berhasil ditemukan (bukan per percobaan)
};

export const TRIAL_CREDITS = 100;

/**
 * Plan yang menentukan fitur mana yang terbuka. Trial aktif pakai fitur plan
 * asli (dibatasi kredit, bukan fitur) supaya blast/CRM/inbox — nilai jual
 * utama — bisa dicoba; status apa pun di luar TRIAL/ACTIVE turun ke Starter.
 */
export function getEffectivePlanId(plan: PlanId, status: string): PlanId {
  return status === "TRIAL" || status === "ACTIVE" ? plan : "STARTER";
}

export interface SubscriptionDates {
  trialEndsAt?: Date | null;
  currentPeriodEnd?: Date | null;
}

/**
 * Status efektif dihitung dari tanggal, bukan dibaca mentah dari kolom status.
 * Tidak ada satu pun proses yang menulis TRIAL_EXPIRED/EXPIRED — kolom itu hanya
 * diubah saat aktivasi dan oleh admin — sehingga trial dan langganan yang sudah
 * lewat tanggal tetap terbaca aktif selamanya bila tidak diturunkan di sini.
 */
export function getEffectiveStatus(
  status: string,
  dates: SubscriptionDates,
  now: Date = new Date(),
): string {
  if (status === "TRIAL" && dates.trialEndsAt && dates.trialEndsAt <= now) return "TRIAL_EXPIRED";
  if (status === "ACTIVE" && dates.currentPeriodEnd && dates.currentPeriodEnd <= now) return "EXPIRED";
  return status;
}

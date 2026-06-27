// Katalog paket langganan & kredit. Sumber kebenaran tunggal untuk harga,
// jatah kredit bulanan, paket top-up, dan biaya kredit per aksi.

export type PlanId = "STARTER" | "GROWTH" | "PRO";
export type BillingCycle = "MONTHLY" | "YEARLY";

export interface PlanFeatures {
  scraper: boolean;
  csvExport: boolean;      // export CSV / Excel
  waValidation: boolean;
  blast: boolean;
  campaigns: boolean;
  crmPipeline: boolean;
  autoFollowUp: boolean;
  inbox: boolean;
  whiteLabel: boolean;
  prioritySupport: boolean;
}

export interface PlanLimits {
  scraperJobsPerMonth: number;
  scraperMaxRadiusKm: number;
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
      campaigns: false,
      crmPipeline: false,
      autoFollowUp: false,
      inbox: false,
      whiteLabel: false,
      prioritySupport: false,
    },
    limits: {
      scraperJobsPerMonth: 20,
      scraperMaxRadiusKm: 5,
      scraperMaxResultsPerJob: 100,
      saveLeadBatchLimit: 100,
      campaignDailyLimit: 100,
    },
  },
  GROWTH: {
    id: "GROWTH",
    name: "Bisnis",
    monthlyPrice: 199_000,
    monthlyCredits: 2_000,
    contactQuota: null,
    features: { ...ALL_FEATURES },
    limits: {
      scraperJobsPerMonth: 250,
      scraperMaxRadiusKm: 15,
      scraperMaxResultsPerJob: 500,
      saveLeadBatchLimit: 500,
      campaignDailyLimit: 1_000,
    },
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    monthlyPrice: 499_000,
    monthlyCredits: 6_000,
    contactQuota: null,
    features: { ...ALL_FEATURES, whiteLabel: true, prioritySupport: true },
    limits: {
      scraperJobsPerMonth: 1_000,
      scraperMaxRadiusKm: 20,
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
export const CREDIT_COSTS = {
  saveLead: 1, // per lead disimpan jadi kontak
  validateNumber: 1, // per nomor divalidasi
};

export const TRIAL_CREDITS = 100;

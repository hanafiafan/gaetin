import { prisma } from "@/lib/db/prisma";

export interface OwnerCmsSettings {
  featureFlags: Record<string, boolean>;
  mediaAssets: Record<string, string>;
  customerFields: { key: string; label: string; enabled: boolean }[];
  experiments: { key: string; name: string; enabled: boolean; audience: string }[];
}

export const DEFAULT_OWNER_CMS: OwnerCmsSettings = {
  featureFlags: {
    scraper: true,
    validator: true,
    blast: true,
    emailBlast: true,
    campaigns: true,
    crm: true,
    inbox: true,
    billing: true,
    betaMapAnalysis: true,
    legacyOsmScraper: false,
  },
  mediaAssets: {
    logo: "",
    favicon: "",
    heroImage: "",
    dashboardPreview: "",
    pricingIllustration: "",
    helpCenterCover: "",
  },
  customerFields: [
    { key: "industry", label: "Industri", enabled: true },
    { key: "companySize", label: "Ukuran tim", enabled: true },
    { key: "mainGoal", label: "Tujuan utama", enabled: true },
    { key: "leadSource", label: "Sumber lead dominan", enabled: true },
    { key: "requestedFeatures", label: "Fitur yang diminta", enabled: true },
    { key: "churnRiskReason", label: "Alasan risiko churn", enabled: true },
  ],
  experiments: [
    { key: "hybrid_pricing", name: "Hybrid subscription + kredit", enabled: true, audience: "new_signups" },
    { key: "guided_onboarding", name: "Onboarding terpandu 5 langkah", enabled: true, audience: "trial" },
    { key: "pro_white_label", name: "White-label khusus Pro", enabled: false, audience: "pro" },
  ],
};

export async function getOwnerCmsSettings(): Promise<OwnerCmsSettings> {
  const setting = await prisma.siteSetting.findUnique({ where: { key: "ownerCms" } });
  if (!setting) return DEFAULT_OWNER_CMS;
  const value = setting.value as Partial<OwnerCmsSettings>;
  // Whitelist merge: cuma key yang masih ada di DEFAULT_OWNER_CMS yang dipakai, supaya
  // flag lama yang sudah dihapus dari kode tidak nyangkut selamanya di data tersimpan.
  const featureFlags = { ...DEFAULT_OWNER_CMS.featureFlags };
  for (const key of Object.keys(featureFlags)) {
    if (value.featureFlags?.[key] !== undefined) featureFlags[key] = value.featureFlags[key];
  }
  return {
    featureFlags,
    mediaAssets: { ...DEFAULT_OWNER_CMS.mediaAssets, ...(value.mediaAssets ?? {}) },
    customerFields: value.customerFields ?? DEFAULT_OWNER_CMS.customerFields,
    experiments: value.experiments ?? DEFAULT_OWNER_CMS.experiments,
  };
}

export async function setOwnerCmsSettings(settings: OwnerCmsSettings): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: "ownerCms" },
    update: { value: settings as unknown as object },
    create: { key: "ownerCms", value: settings as unknown as object },
  });
}

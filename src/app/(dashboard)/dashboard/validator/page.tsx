import ValidatorClient from "@/components/dashboard/validator-client";
import PageHero from "@/components/dashboard/page-hero";
import { Gauge, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function ValidatorPage() {
  await requirePlanFeature("waValidation");
  return (
    <div className="space-y-5">
      <PageHero
        title="Cek Nomor WhatsApp"
        description="Periksa dulu nomor mana yang benar-benar aktif di WhatsApp, supaya pesanmu tidak terbuang ke nomor mati."
      />
      <ValidatorClient />
    </div>
  );
}

import ValidatorClient from "@/components/dashboard/validator-client";
import PageHero from "@/components/dashboard/page-hero";
import { Gauge, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function ValidatorPage() {
  await requirePlanFeature("waValidation");
  return (
    <div className="space-y-5">
      <PageHero
        kicker="Number Hygiene"
        kickerIcon={Sparkles}
        title="Validasi Nomor"
        description="Cek nomor aktif WhatsApp sebelum outreach untuk menghemat kredit dan menjaga delivery rate."
        features={[
          { icon: ShieldCheck, label: "Deteksi aktif/tidak aktif" },
          { icon: Gauge, label: "Progress real-time" },
          { icon: WalletCards, label: "Menggunakan kredit validasi" },
        ]}
      />
      <ValidatorClient />
    </div>
  );
}

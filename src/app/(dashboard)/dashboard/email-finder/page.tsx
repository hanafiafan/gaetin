import EmailFinderClient from "@/components/dashboard/email-finder-client";
import PageHero from "@/components/dashboard/page-hero";
import { Globe2, Search, Sparkles, Zap } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function EmailFinderPage() {
  await requirePlanFeature("emailBlast");
  return (
    <div className="space-y-5">
      <PageHero
        title="Temukan Alamat Email"
        description="Sistem membuka website tiap bisnis dan mencari alamat emailnya untukmu. Berjalan sendiri di latar belakang."
      />
      <EmailFinderClient />
    </div>
  );
}

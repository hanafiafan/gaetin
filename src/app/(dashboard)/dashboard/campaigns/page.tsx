import CampaignsClient from "@/components/dashboard/campaigns-client";
import PageHero from "@/components/dashboard/page-hero";
import { CalendarClock, Megaphone, PauseCircle, Sparkles } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function CampaignsPage() {
  await requirePlanFeature("campaigns");
  return (
    <div className="space-y-5">
      <PageHero
        kicker="Campaign Manager"
        kickerIcon={Sparkles}
        title="Kampanye"
        description="Rencanakan outreach terjadwal, pilih template, pause/resume saat dibutuhkan, dan pantau progress pengiriman."
        features={[
          { icon: CalendarClock, label: "Jadwalkan campaign minimal 5 menit ke depan" },
          { icon: PauseCircle, label: "Pause dan lanjutkan progress" },
          { icon: Megaphone, label: "Cocok untuk follow-up promo dan edukasi" },
        ]}
      />
      <CampaignsClient />
    </div>
  );
}

import CampaignsClient from "@/components/dashboard/campaigns-client";
import PageHero from "@/components/dashboard/page-hero";
import { CalendarClock, Megaphone, PauseCircle, Sparkles } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function CampaignsPage() {
  await requirePlanFeature("campaigns");
  return (
    <div className="space-y-5">
      <PageHero
        title="Kirim Pesan WhatsApp"
        description="Kirim satu pesan WhatsApp ke banyak kontak sekaligus. Bisa dijadwalkan, dihentikan, dan dilanjutkan kapan saja."
      />
      <CampaignsClient />
    </div>
  );
}

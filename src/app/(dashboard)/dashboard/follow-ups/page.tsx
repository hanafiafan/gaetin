import FollowUpsClient from "@/components/dashboard/followups-client";
import PageHero from "@/components/dashboard/page-hero";
import { Bot, Clock, Repeat, Sparkles } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function FollowUpsPage() {
  await requirePlanFeature("autoFollowUp");
  return (
    <div className="space-y-5">
      <PageHero
        kicker="Automation"
        kickerIcon={Sparkles}
        title="Follow-up Otomatis"
        description="Buat aturan tindak lanjut untuk kontak yang belum membalas. Rangkaian berhenti saat kontak membalas."
        features={[
          { icon: Repeat, label: "No-reply follow-up" },
          { icon: Bot, label: "Otomasi berbasis aturan" },
          { icon: Clock, label: "Cron-ready untuk produksi" },
        ]}
      />
      <FollowUpsClient />
    </div>
  );
}

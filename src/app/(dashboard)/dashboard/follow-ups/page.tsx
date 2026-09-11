import FollowUpsClient from "@/components/dashboard/followups-client";
import PageHero from "@/components/dashboard/page-hero";
import { Bot, Clock, Repeat, Sparkles } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function FollowUpsPage() {
  await requirePlanFeature("autoFollowUp");
  return (
    <div className="space-y-5">
      <PageHero
        title="Pesan Susulan"
        description="Kalau kontak belum membalas setelah beberapa hari, sistem mengirim pesan susulan otomatis. Berhenti sendiri begitu dibalas."
      />
      <FollowUpsClient />
    </div>
  );
}

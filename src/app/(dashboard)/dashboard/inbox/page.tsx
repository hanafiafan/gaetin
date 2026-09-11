import InboxClient from "@/components/dashboard/inbox-client";
import PageHero from "@/components/dashboard/page-hero";
import { Headphones, MessageSquare, Sparkles, UserCheck } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function InboxPage() {
  await requirePlanFeature("inbox");
  return (
    <div className="space-y-5">
      <PageHero
        title="Pesan Masuk"
        description="Balasan dari calon pembeli masuk ke sini. Balas langsung tanpa pindah aplikasi."
      />
      <InboxClient />
    </div>
  );
}

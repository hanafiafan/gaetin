import InboxClient from "@/components/dashboard/inbox-client";
import PageHero from "@/components/dashboard/page-hero";
import { Headphones, MessageSquare, Sparkles, UserCheck } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function InboxPage() {
  await requirePlanFeature("inbox");
  return (
    <div className="space-y-5">
      <PageHero
        kicker="Conversation Hub"
        kickerIcon={Sparkles}
        title="Inbox"
        description="Balasan WhatsApp masuk di sini. Balas cepat, ubah status percakapan, dan jaga momentum closing."
        features={[
          { icon: MessageSquare, label: "Percakapan dua arah" },
          { icon: UserCheck, label: "Status open, pending, resolved" },
          { icon: Headphones, label: "Cocok untuk sales dan customer support" },
        ]}
      />
      <InboxClient />
    </div>
  );
}

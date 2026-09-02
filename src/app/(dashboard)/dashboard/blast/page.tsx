import BlastClient from "@/components/dashboard/blast-client";
import PageHero from "@/components/dashboard/page-hero";
import { MessageSquareText, Send, ShieldCheck, Sparkles } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function BlastPage() {
  await requirePlanFeature("blast");
  return (
    <div className="space-y-5">
      <PageHero
        kicker="Outreach Engine"
        kickerIcon={Sparkles}
        title="WhatsApp Blast"
        description="Kirim pesan personal ke segmen kontak dengan jeda aman, variasi teks, dan progress yang mudah dipantau."
        features={[
          { icon: Send, label: "Blast cepat untuk campaign satu kali" },
          { icon: MessageSquareText, label: "Mendukung personalisasi dan spintax" },
          { icon: ShieldCheck, label: "Disarankan hanya ke kontak consent/aktif" },
        ]}
      />
      <BlastClient />
    </div>
  );
}

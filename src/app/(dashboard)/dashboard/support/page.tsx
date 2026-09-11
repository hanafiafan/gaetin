import SupportClient from "@/components/dashboard/support-client";
import PageHero from "@/components/dashboard/page-hero";
import { HelpCircle, LifeBuoy, MessageCircleQuestion, Sparkles } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-5">
      <PageHero
        tone="akun"
        kicker="Help Center"
        kickerIcon={Sparkles}
        title="Bantuan"
        description="Lihat FAQ, dokumentasi ringkas, atau kirim tiket bila butuh bantuan."
      />
      <SupportClient />
    </div>
  );
}

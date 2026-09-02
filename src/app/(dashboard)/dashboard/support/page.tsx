import SupportClient from "@/components/dashboard/support-client";
import PageHero from "@/components/dashboard/page-hero";
import { HelpCircle, LifeBuoy, MessageCircleQuestion, Sparkles } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-5">
      <PageHero
        kicker="Help Center"
        kickerIcon={Sparkles}
        title="Bantuan"
        description="Lihat FAQ, dokumentasi ringkas, atau kirim tiket bila butuh bantuan."
        features={[
          { icon: HelpCircle, label: "FAQ produk" },
          { icon: LifeBuoy, label: "Tiket support" },
          { icon: MessageCircleQuestion, label: "Panduan fitur" },
        ]}
      />
      <SupportClient />
    </div>
  );
}

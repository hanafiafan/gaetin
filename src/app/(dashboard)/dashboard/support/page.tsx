import SupportClient from "@/components/dashboard/support-client";
import PageHero from "@/components/dashboard/page-hero";
import { HelpCircle, LifeBuoy, MessageCircleQuestion, Sparkles } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-5">
      <PageHero
        title="Bantuan"
        description="Jawaban atas pertanyaan yang sering ditanyakan. Belum terjawab? Kirim keluhanmu di sini."
      />
      <SupportClient />
    </div>
  );
}

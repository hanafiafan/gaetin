import TemplatesClient from "@/components/dashboard/templates-client";
import PageHero from "@/components/dashboard/page-hero";
import { Braces, FileText, Sparkles, Wand2 } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="space-y-5">
      <PageHero
        tone="whatsapp"
        kicker="Message Library"
        kickerIcon={Sparkles}
        title="Template Pesan"
        description="Simpan pesan yang sering dipakai untuk blast, campaign, dan follow-up."
      />
      <TemplatesClient />
    </div>
  );
}

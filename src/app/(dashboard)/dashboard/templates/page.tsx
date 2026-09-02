import TemplatesClient from "@/components/dashboard/templates-client";
import PageHero from "@/components/dashboard/page-hero";
import { Braces, FileText, Sparkles, Wand2 } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="space-y-5">
      <PageHero
        kicker="Message Library"
        kickerIcon={Sparkles}
        title="Template Pesan"
        description="Simpan pesan yang sering dipakai untuk blast, campaign, dan follow-up."
        features={[
          { icon: Braces, label: "Personalisasi {{nama}}" },
          { icon: Wand2, label: "Spintax {a|b}" },
          { icon: FileText, label: "Reusable copy library" },
        ]}
      />
      <TemplatesClient />
    </div>
  );
}

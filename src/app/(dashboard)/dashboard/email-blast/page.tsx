import EmailBlastClient from "@/components/dashboard/email-blast-client";
import PageHero from "@/components/dashboard/page-hero";
import { Mail, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function EmailBlastPage() {
  await requirePlanFeature("emailBlast");
  return (
    <div className="space-y-5">
      <PageHero
        tone="email"
        kicker="Outreach Engine"
        kickerIcon={Sparkles}
        title="Email Blast"
        description="Kirim email personal ke kontak yang punya alamat email, dengan personalisasi dan progress yang mudah dipantau."
        features={[
          { icon: Mail, label: "Target otomatis ke kontak yang punya email" },
          { icon: Wand2, label: "Mendukung personalisasi dan spintax" },
          { icon: ShieldCheck, label: "Perlu provider email aktif di Admin > Integrasi" },
        ]}
      />
      <EmailBlastClient />
    </div>
  );
}

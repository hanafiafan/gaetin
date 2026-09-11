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
        kicker="Email"
        title="Kirim Email Massal"
        description="Kirim email ke banyak kontak sekaligus. Nama dan kota tiap penerima bisa disisipkan otomatis."
      />
      <EmailBlastClient />
    </div>
  );
}

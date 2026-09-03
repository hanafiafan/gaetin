import EmailFinderClient from "@/components/dashboard/email-finder-client";
import PageHero from "@/components/dashboard/page-hero";
import { Globe2, Search, Sparkles, Zap } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function EmailFinderPage() {
  await requirePlanFeature("emailBlast");
  return (
    <div className="space-y-5">
      <PageHero
        tone="email"
        kicker="Enrichment Engine"
        kickerIcon={Sparkles}
        title="Cari Email"
        description="Kunjungi website lead atau kontak yang belum punya email, temukan alamat emailnya secara otomatis di latar belakang."
        features={[
          { icon: Globe2, label: "Cek beranda + halaman kontak umum" },
          { icon: Zap, label: "Jalan di latar belakang, tidak perlu tunggu" },
          { icon: Search, label: "Dari hasil scraping atau kontak tersimpan" },
        ]}
      />
      <EmailFinderClient />
    </div>
  );
}

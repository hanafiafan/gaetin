import ScraperClient from "@/components/dashboard/scraper-client";
import PageHero from "@/components/dashboard/page-hero";
import { ShieldAlert, Sparkles } from "lucide-react";
import { getOwnerCmsSettings } from "@/lib/owner-cms";

export default async function ScraperPage() {
  const settings = await getOwnerCmsSettings();
  const legacyOsmEnabled = settings.featureFlags?.legacyOsmScraper ?? false;

  return (
    <div className="space-y-6">
      <PageHero
        kicker="Market Research Engine"
        kickerIcon={Sparkles}
        title="Scraper Lead"
        description={
          legacyOsmEnabled
            ? "Tentukan area di peta, atur radius, cari bisnis potensial, lalu simpan lead terpilih menjadi kontak siap outreach."
            : "Ekstrak data bisnis langsung dari Google Maps via ekstensi Chrome, lalu simpan ke CRM dalam satu klik."
        }
        rightSlot={
          <div className="flex h-full items-center justify-end lg:items-start lg:justify-start">
            <div className="flex items-center gap-1.5 rounded-lg border border-warning/20 bg-warning/5 px-3 py-2 text-xs text-warning">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              Gunakan secara bertanggung jawab
            </div>
          </div>
        }
      />
      <ScraperClient legacyOsmEnabled={legacyOsmEnabled} />
    </div>
  );
}

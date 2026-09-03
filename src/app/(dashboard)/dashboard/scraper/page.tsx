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
        tone="primary"
        kicker="Market Research Engine"
        kickerIcon={Sparkles}
        title="Scraper Lead"
        description={
          legacyOsmEnabled
            ? "Tentukan area di peta, atur radius, cari bisnis potensial, lalu simpan lead terpilih menjadi kontak siap outreach."
            : "Ekstrak data bisnis langsung dari Google Maps via ekstensi Chrome, lalu simpan ke CRM dalam satu klik."
        }
        rightSlot={
          <div className="flex items-end lg:justify-end">
            <span className="cg-label flex items-center gap-2 border-l-2 border-warning pl-3 text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-warning" />
              Gunakan secara bertanggung jawab
            </span>
          </div>
        }
      />
      <ScraperClient legacyOsmEnabled={legacyOsmEnabled} />
    </div>
  );
}

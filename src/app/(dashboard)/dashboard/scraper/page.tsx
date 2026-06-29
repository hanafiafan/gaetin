import ScraperClient from "@/components/dashboard/scraper-client";
import { ShieldAlert, Sparkles } from "lucide-react";
import { getOwnerCmsSettings } from "@/lib/owner-cms";

export default async function ScraperPage() {
  const settings = await getOwnerCmsSettings();
  const legacyOsmEnabled = settings.featureFlags?.legacyOsmScraper ?? false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium tracking-wide text-primary">
            <Sparkles className="h-3 w-3" />
            Market Research Engine
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Scraper Lead</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {legacyOsmEnabled
              ? "Tentukan area di peta, atur radius, cari bisnis potensial, lalu simpan lead terpilih menjadi kontak siap outreach."
              : "Ekstrak data bisnis langsung dari Google Maps via ekstensi Chrome, lalu simpan ke CRM dalam satu klik."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-400">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          Gunakan secara bertanggung jawab
        </div>
      </div>
      <ScraperClient legacyOsmEnabled={legacyOsmEnabled} />
    </div>
  );
}

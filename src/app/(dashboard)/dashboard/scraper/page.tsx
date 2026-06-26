import ScraperClient from "@/components/dashboard/scraper-client";
import { Badge } from "@/components/ui/badge";
import { MapPin, Radar, ShieldAlert, Sparkles } from "lucide-react";
import { getOwnerCmsSettings } from "@/lib/owner-cms";

export default async function ScraperPage() {
  const settings = await getOwnerCmsSettings();
  const legacyOsmEnabled = settings.featureFlags?.legacyOsmScraper ?? false;

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10">
              <Sparkles className="h-3.5 w-3.5" />
              Market Research Engine
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Scraper Lead</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {legacyOsmEnabled 
                ? "Tentukan area di peta, atur radius, cari bisnis potensial, lalu simpan lead terpilih menjadi kontak siap outreach." 
                : "Gunakan ekstensi Chrome Gaetin untuk menyedot kontak prospek secara otomatis dari Google Maps dan menyimpannya ke CRM Anda."}
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            {legacyOsmEnabled && (
              <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
                <MapPin className="h-4 w-4 text-primary" />
                Peta interaktif + radius pencarian
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
              <Radar className="h-4 w-4 text-primary" />
              Kurasi hasil sebelum masuk database
            </div>
            <div className="flex items-center gap-2 rounded-xl border bg-amber-500/10 px-3 py-2 text-amber-800 dark:text-amber-300">
              <ShieldAlert className="h-4 w-4" />
              Gunakan scraping secara bertanggung jawab
            </div>
          </div>
        </div>
      </div>
      <ScraperClient legacyOsmEnabled={legacyOsmEnabled} />
    </div>
  );
}

import ScraperClient from "@/components/dashboard/scraper-client";
import PageHero from "@/components/dashboard/page-hero";
import { ShieldAlert } from "lucide-react";

export default function ScraperPage() {
  return (
    <div className="space-y-6">
      <PageHero
        title="Cari Bisnis di Maps"
        description="Ekstrak data bisnis langsung dari Google Maps via ekstensi Chrome, lalu simpan ke CRM dalam satu klik."
        rightSlot={
          <div className="flex items-end lg:justify-end">
            <span className="cg-label flex items-center gap-2 border-l-2 border-warning pl-3 text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-warning" />
              Gunakan secara bertanggung jawab
            </span>
          </div>
        }
      />
      <ScraperClient />
    </div>
  );
}

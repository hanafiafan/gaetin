import EmailFinderClient from "@/components/dashboard/email-finder-client";
import { Globe2, Search, Sparkles, Zap } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function EmailFinderPage() {
  await requirePlanFeature("emailBlast");
  return (
    <div className="space-y-5">
      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Enrichment Engine</span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Cari Email</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Kunjungi website lead atau kontak yang belum punya email, temukan alamat emailnya secara otomatis di latar belakang.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><Globe2 className="h-4 w-4 text-primary" /> Cek beranda + halaman kontak umum</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><Zap className="h-4 w-4 text-primary" /> Jalan di latar belakang, tidak perlu tunggu</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><Search className="h-4 w-4 text-primary" /> Dari hasil scraping atau kontak tersimpan</div>
          </div>
        </div>
      </div>
      <EmailFinderClient />
    </div>
  );
}

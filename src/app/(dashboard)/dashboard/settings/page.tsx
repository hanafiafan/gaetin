import WhatsAppAccounts from "@/components/dashboard/whatsapp-accounts";
import ScraperSettings from "@/components/dashboard/scraper-settings";
import BrandingSettings from "@/components/dashboard/branding-settings";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Map, Palette, Settings, Sparkles, Smartphone } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <div className="overflow-hidden rounded-3xl border bg-card/60 shadow-sm backdrop-blur-xl">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col justify-center">
            <div>
              <Badge className="mb-4 gap-2 bg-primary/15 text-primary hover:bg-primary/20"><Sparkles className="h-3.5 w-3.5" /> Workspace Settings</Badge>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Pengaturan</h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">Konfigurasi koneksi WhatsApp, sumber data scraping, dan white-label branding workspace.</p>
            </div>
          </div>
          <div className="grid gap-3 rounded-2xl border bg-background/50 p-5 shadow-inner text-sm">
            <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 font-medium transition hover:bg-muted"><Smartphone className="h-5 w-5 text-primary" /> Akun WhatsApp</div>
            <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 font-medium transition hover:bg-muted"><Settings className="h-5 w-5 text-primary" /> Provider scraping</div>
            <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 font-medium transition hover:bg-muted"><Palette className="h-5 w-5 text-primary" /> White-label branding</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-3xl border shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6 max-w-2xl">
              <h2 className="flex items-center gap-3 text-xl font-bold text-foreground"><Smartphone className="h-6 w-6 text-primary" /> Koneksi WhatsApp</h2>
              <p className="mt-2 text-sm text-muted-foreground">Hubungkan satu atau lebih nomor WhatsApp. Tiap nomor punya batas kirim harian sendiri.</p>
            </div>
            <div className="rounded-2xl border bg-background/50 p-6">
              <WhatsAppAccounts />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6 max-w-2xl">
              <h2 className="flex items-center gap-3 text-xl font-bold text-foreground"><Settings className="h-6 w-6 text-primary" /> Sumber data scraping</h2>
              <p className="mt-2 text-sm text-muted-foreground">OSM + scraper (gratis) atau Google Places API resmi (berbayar, pakai API key sendiri).</p>
            </div>
            <div className="rounded-2xl border bg-background/50 p-6">
              <ScraperSettings />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-6 max-w-2xl">
              <h2 className="flex items-center gap-3 text-xl font-bold text-foreground"><Palette className="h-6 w-6 text-primary" /> White-label branding</h2>
              <p className="mt-2 text-sm text-muted-foreground">Ganti nama aplikasi, warna, dan logo (khusus paket Pro).</p>
            </div>
            <div className="rounded-2xl border bg-background/50 p-6">
              <BrandingSettings />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import WhatsAppAccounts from "@/components/dashboard/whatsapp-accounts";
import ScraperSettings from "@/components/dashboard/scraper-settings";
import BrandingSettings from "@/components/dashboard/branding-settings";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Map, Palette, Settings, Sparkles, Smartphone } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-5xl space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10"><Sparkles className="h-3.5 w-3.5" /> Workspace Settings</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Pengaturan</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Koneksi WhatsApp, sumber data scraping, dan branding workspace.</p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Smartphone className="h-4 w-4 text-primary" /> Akun WhatsApp</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Map className="h-4 w-4 text-primary" /> Provider scraping</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Palette className="h-4 w-4 text-primary" /> White-label branding</div>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm"><CardContent className="space-y-3 p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Smartphone className="h-5 w-5 text-primary" /> Koneksi WhatsApp</h2>
        <p className="text-sm text-muted-foreground">Hubungkan satu atau lebih nomor WhatsApp. Tiap nomor punya batas kirim harian sendiri.</p>
        <WhatsAppAccounts />
      </CardContent></Card>

      <Card className="rounded-2xl shadow-sm"><CardContent className="space-y-3 p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Settings className="h-5 w-5 text-primary" /> Sumber data scraping</h2>
        <p className="text-sm text-muted-foreground">OSM + scraper (gratis) atau Google Places API resmi (berbayar, pakai API key sendiri).</p>
        <ScraperSettings />
      </CardContent></Card>

      <Card className="rounded-2xl shadow-sm"><CardContent className="space-y-3 p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Palette className="h-5 w-5 text-primary" /> White-label branding</h2>
        <p className="text-sm text-muted-foreground">Ganti nama aplikasi, warna, dan logo (fitur Pro).</p>
        <BrandingSettings />
      </CardContent></Card>
    </div>
  );
}

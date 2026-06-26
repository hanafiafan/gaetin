import WhatsAppAccounts from "@/components/dashboard/whatsapp-accounts";
import ScraperSettings from "@/components/dashboard/scraper-settings";
import BrandingSettings from "@/components/dashboard/branding-settings";
import { Map, Palette, Settings, Sparkles, Smartphone } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <div className="cg-card overflow-hidden rounded-3xl">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Workspace Settings
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-white">Pengaturan</h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-400">
              Konfigurasi koneksi WhatsApp, sumber data scraping, dan white-label branding workspace.
            </p>
          </div>
          <div className="grid gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-sm">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 font-medium text-slate-300 transition hover:bg-white/[0.04]">
              <Smartphone className="h-5 w-5 text-primary" /> Akun WhatsApp
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 font-medium text-slate-300 transition hover:bg-white/[0.04]">
              <Settings className="h-5 w-5 text-primary" /> Provider scraping
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 font-medium text-slate-300 transition hover:bg-white/[0.04]">
              <Palette className="h-5 w-5 text-primary" /> White-label branding
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="cg-card rounded-3xl p-6 sm:p-8">
          <div className="mb-6 max-w-2xl">
            <h2 className="flex items-center gap-3 text-xl font-bold text-white">
              <Smartphone className="h-6 w-6 text-primary" /> Koneksi WhatsApp
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Hubungkan satu atau lebih nomor WhatsApp. Tiap nomor punya batas kirim harian sendiri.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <WhatsAppAccounts />
          </div>
        </div>

        <div className="cg-card rounded-3xl p-6 sm:p-8">
          <div className="mb-6 max-w-2xl">
            <h2 className="flex items-center gap-3 text-xl font-bold text-white">
              <Settings className="h-6 w-6 text-primary" /> Sumber data scraping
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              OSM + scraper (gratis) atau Google Places API resmi (berbayar, pakai API key sendiri).
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <ScraperSettings />
          </div>
        </div>

        <div className="cg-card rounded-3xl p-6 sm:p-8">
          <div className="mb-6 max-w-2xl">
            <h2 className="flex items-center gap-3 text-xl font-bold text-white">
              <Palette className="h-6 w-6 text-primary" /> White-label branding
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Ganti nama aplikasi, warna, dan logo (khusus paket Pro).
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <BrandingSettings />
          </div>
        </div>
      </div>
    </div>
  );
}

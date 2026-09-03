import WhatsAppAccounts from "@/components/dashboard/whatsapp-accounts";
import WorkspaceProfileSettings from "@/components/dashboard/workspace-profile-settings";
import AccountSettings from "@/components/dashboard/account-settings";
import PageHero from "@/components/dashboard/page-hero";
import { Building2, Chrome, Download, Settings, Smartphone, Sparkles, UserCircle } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <PageHero
        kicker="Workspace Settings"
        kickerIcon={Sparkles}
        title="Pengaturan"
        description="Konfigurasi koneksi WhatsApp, profil workspace, dan pengaturan akun Anda."
        features={[
          { icon: Smartphone, label: "Akun WhatsApp" },
          { icon: Building2, label: "Profil workspace" },
          { icon: UserCircle, label: "Akun & keamanan" },
          { icon: Chrome, label: "Ekstensi Chrome" },
        ]}
      />

      <div className="grid gap-6">
        {/* WhatsApp */}
        <div className="cg-card rounded-3xl p-6 sm:p-8">
          <div className="mb-6 max-w-2xl">
            <h2 className="flex items-center gap-3 text-xl font-bold text-foreground">
              <Smartphone className="h-6 w-6 text-foreground" /> Koneksi WhatsApp
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Hubungkan satu atau lebih nomor WhatsApp. Tiap nomor punya batas kirim harian sendiri.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <WhatsAppAccounts />
          </div>
        </div>

        {/* Workspace profile */}
        <div className="cg-card rounded-3xl p-6 sm:p-8">
          <div className="mb-6 max-w-2xl">
            <h2 className="flex items-center gap-3 text-xl font-bold text-foreground">
              <Building2 className="h-6 w-6 text-foreground" /> Profil Workspace
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Nama dan informasi workspace Anda.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <WorkspaceProfileSettings />
          </div>
        </div>

        {/* Account & security */}
        <div className="cg-card rounded-3xl p-6 sm:p-8">
          <div className="mb-6 max-w-2xl">
            <h2 className="flex items-center gap-3 text-xl font-bold text-foreground">
              <UserCircle className="h-6 w-6 text-foreground" /> Akun & Keamanan
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Perbarui nama, zona waktu, dan password akun Anda.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <AccountSettings />
          </div>
        </div>

        {/* Chrome extension */}
        <div className="cg-card rounded-3xl p-6 sm:p-8">
          <div className="mb-6 max-w-2xl">
            <h2 className="flex items-center gap-3 text-xl font-bold text-foreground">
              <Chrome className="h-6 w-6 text-foreground" /> Ekstensi Chrome
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ekstensi yang menjalankan scraping otomatis dari Google Maps di browser Anda.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-foreground">Ekstensi Hellens untuk Chrome</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Versi terbaru · Kompatibel dengan Chrome 100+ · Lihat panduan instalasi lengkap di{" "}
                <a href="/dashboard/setup" className="text-foreground hover:underline">Setup Ekstensi</a>.
              </p>
            </div>
            <a
              href="/extension.zip"
              download
              className="flex h-10 shrink-0 items-center gap-2 bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Download .ZIP
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

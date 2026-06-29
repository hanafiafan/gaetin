import WhatsAppAccounts from "@/components/dashboard/whatsapp-accounts";
import WorkspaceProfileSettings from "@/components/dashboard/workspace-profile-settings";
import AccountSettings from "@/components/dashboard/account-settings";
import { Building2, Settings, Smartphone, Sparkles, UserCircle } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <div className="cg-card overflow-hidden rounded-3xl">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Workspace Settings
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Pengaturan</h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              Konfigurasi koneksi WhatsApp, profil workspace, dan pengaturan akun Anda.
            </p>
          </div>
          <div className="grid gap-3 rounded-2xl border border-border bg-card p-5 text-sm">
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 font-medium text-foreground/80 transition hover:bg-card">
              <Smartphone className="h-5 w-5 text-primary" /> Akun WhatsApp
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 font-medium text-foreground/80 transition hover:bg-card">
              <Building2 className="h-5 w-5 text-primary" /> Profil workspace
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 font-medium text-foreground/80 transition hover:bg-card">
              <UserCircle className="h-5 w-5 text-primary" /> Akun & keamanan
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* WhatsApp */}
        <div className="cg-card rounded-3xl p-6 sm:p-8">
          <div className="mb-6 max-w-2xl">
            <h2 className="flex items-center gap-3 text-xl font-bold text-foreground">
              <Smartphone className="h-6 w-6 text-primary" /> Koneksi WhatsApp
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
              <Building2 className="h-6 w-6 text-primary" /> Profil Workspace
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
              <UserCircle className="h-6 w-6 text-primary" /> Akun & Keamanan
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Perbarui nama, zona waktu, dan password akun Anda.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <AccountSettings />
          </div>
        </div>
      </div>
    </div>
  );
}

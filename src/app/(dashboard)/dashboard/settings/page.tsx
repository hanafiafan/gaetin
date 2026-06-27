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
            <h1 className="text-3xl font-bold tracking-tight text-white">Pengaturan</h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-400">
              Konfigurasi koneksi WhatsApp, profil workspace, dan pengaturan akun Anda.
            </p>
          </div>
          <div className="grid gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-sm">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 font-medium text-slate-300 transition hover:bg-white/[0.04]">
              <Smartphone className="h-5 w-5 text-primary" /> Akun WhatsApp
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 font-medium text-slate-300 transition hover:bg-white/[0.04]">
              <Building2 className="h-5 w-5 text-primary" /> Profil workspace
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 font-medium text-slate-300 transition hover:bg-white/[0.04]">
              <UserCircle className="h-5 w-5 text-primary" /> Akun & keamanan
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* WhatsApp */}
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

        {/* Workspace profile */}
        <div className="cg-card rounded-3xl p-6 sm:p-8">
          <div className="mb-6 max-w-2xl">
            <h2 className="flex items-center gap-3 text-xl font-bold text-white">
              <Building2 className="h-6 w-6 text-primary" /> Profil Workspace
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Nama dan informasi workspace Anda.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <WorkspaceProfileSettings />
          </div>
        </div>

        {/* Account & security */}
        <div className="cg-card rounded-3xl p-6 sm:p-8">
          <div className="mb-6 max-w-2xl">
            <h2 className="flex items-center gap-3 text-xl font-bold text-white">
              <UserCircle className="h-6 w-6 text-primary" /> Akun & Keamanan
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Perbarui nama, zona waktu, dan password akun Anda.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <AccountSettings />
          </div>
        </div>
      </div>
    </div>
  );
}

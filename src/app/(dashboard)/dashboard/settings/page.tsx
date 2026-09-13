import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import WhatsAppAccounts from "@/components/dashboard/whatsapp-accounts";
import WorkspaceProfileSettings from "@/components/dashboard/workspace-profile-settings";
import AccountSettings from "@/components/dashboard/account-settings";
import PageHero from "@/components/dashboard/page-hero";
import { Building2, Chrome, Download, Smartphone, Sparkles, UserCircle } from "lucide-react";

/**
 * Kartu setelan: pita judul dipisahkan garis rambut, lalu isinya langsung.
 *
 * Sebelumnya tiap seksi adalah kartu ber-padding 8 yang membungkus KARTU LAIN
 * ber-padding 6 — dua border dan dua lapis padding untuk satu form. Empat kali
 * berturut-turut, masing-masing disalin manual.
 */
function SettingsSection({
  icon: Icon,
  title,
  description,
  /** Hanya seksi pertama yang membawa warna area — satu aksen per halaman,
   * sama seperti halaman lain. Empat garis warna berjajar terbaca berulang. */
  accent = false,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("cg-card overflow-hidden rounded-xl", accent && "cg-tone-top")}>
      <header className="flex items-start gap-3 border-b border-border bg-muted/40 px-5 py-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.06] text-foreground/70">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PageHero
        title="Pengaturan"
        description="Sambungkan nomor WhatsApp, ubah nama workspace, dan atur keamanan akunmu."
      />

      <SettingsSection
        accent
        icon={Smartphone}
        title="Koneksi WhatsApp"
        description="Hubungkan satu atau lebih nomor WhatsApp. Tiap nomor punya batas kirim harian sendiri."
      >
        <WhatsAppAccounts />
      </SettingsSection>

      <SettingsSection
        icon={Building2}
        title="Profil Workspace"
        description="Nama dan informasi workspace Anda."
      >
        <WorkspaceProfileSettings />
      </SettingsSection>

      <SettingsSection
        icon={UserCircle}
        title="Akun & Keamanan"
        description="Perbarui nama, zona waktu, dan password akun Anda."
      >
        <AccountSettings />
      </SettingsSection>

      <SettingsSection
        icon={Chrome}
        title="Ekstensi Chrome"
        description="Alat yang mengambil data bisnis dari Google Maps lewat browser Chrome-mu."
      >
        <div className="flex flex-col items-start gap-4 rounded-lg border border-primary/25 bg-primary/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-foreground">Ekstensi Hellens untuk Chrome</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Versi terbaru · Kompatibel dengan Chrome 100+ · Lihat panduan instalasi lengkap di{" "}
              <a href="/dashboard/setup" className="font-medium text-foreground hover:underline">
                Setup Ekstensi
              </a>
              .
            </p>
          </div>
          <a
            href="/extension.zip"
            download
            className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            Download .ZIP
          </a>
        </div>
      </SettingsSection>
    </div>
  );
}

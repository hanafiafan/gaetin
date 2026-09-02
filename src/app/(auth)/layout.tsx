import Link from "next/link";
import StatRow from "@/components/brand/stat-row";
import { Check } from "lucide-react";

const benefits = [
  "Scraping lead dari Google Maps dengan ekstensi Chrome",
  "Blast WhatsApp ke ribuan kontak sekaligus",
  "CRM pipeline, follow-up otomatis, dan inbox terpadu",
  "Laporan performa real-time dan export CSV",
  "Multi-anggota tim dengan role terpisah",
];

const stats = [
  { value: "100", label: "kredit trial" },
  { value: "5", label: "menit setup" },
  { value: "24/7", label: "tanpa kontrak" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_520px]">
      {/* Left panel — inverted */}
      <section className="relative hidden bg-foreground p-10 text-background lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/brand/hellens-mark-white.png" alt="" className="h-7 w-7" />
          <span className="cg-display text-2xl">Hellens</span>
        </Link>

        <div className="mt-auto py-10">
          <span className="cg-label bg-primary px-2.5 py-1.5 text-primary-foreground">
            Prospek &amp; WhatsApp marketing
          </span>

          <h1 className="cg-display mt-7 max-w-lg text-[clamp(2.5rem,5vw,4rem)]">
            Dari scraping lead sampai closing.
          </h1>

          <p className="mt-6 max-w-sm text-sm leading-7 opacity-60">
            Hellens menggabungkan scraping Google Maps, WhatsApp blast, CRM pipeline, dan laporan
            dalam satu platform operasional yang rapi.
          </p>

          <StatRow stats={stats} inverted className="mt-10 border-t border-background/20" />

          <div className="mt-10 space-y-3">
            {benefits.map((b) => (
              <div key={b} className="flex items-start gap-3 text-sm opacity-80">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                {b}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-6 border-t border-background/20 pt-6">
          <span className="cg-label opacity-50">Data terenkripsi SSL</span>
          <span className="cg-label opacity-50">Multi-tenant</span>
          <span className="cg-label opacity-50">Google Maps</span>
        </div>
      </section>

      {/* Right panel — the form */}
      <section className="flex min-h-screen items-center justify-center border-l border-border px-4 py-8 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <img src="/brand/hellens-mark-black.png" alt="" className="h-7 w-7" />
              <span className="cg-display text-2xl">Hellens</span>
            </Link>
            <p className="cg-label mt-3 text-muted-foreground">
              Cari leads · Gaet pelanggan · Tutup deal
            </p>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}

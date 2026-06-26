import Link from "next/link";
import { Check, Search, Send, MessageSquare, BarChart3, Shield, Users, Zap } from "lucide-react";

const benefits = [
  "Scraping lead dari Google Maps dengan ekstensi Chrome",
  "Blast WhatsApp ke ribuan kontak sekaligus",
  "CRM pipeline, follow-up otomatis, dan inbox terpadu",
  "Laporan performa real-time dan export CSV",
  "Multi-anggota tim dengan role terpisah",
];

const stats = [
  { value: "100", label: "kredit trial gratis" },
  { value: "5", label: "menit setup" },
  { value: "24/7", label: "tanpa kontrak" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-[#060810] lg:grid-cols-[minmax(0,1fr)_520px]">
      {/* Left panel */}
      <section className="relative hidden overflow-hidden border-r border-white/[0.07] bg-[#060810] p-10 lg:flex lg:flex-col">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
        </div>

        <Link href="/" className="relative flex items-center gap-3">
          <span className="gradient-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white shadow-glow">
            G
          </span>
          <span className="text-xl font-black text-white">gaetin</span>
        </Link>

        <div className="relative mt-auto flex flex-col justify-center py-10">
          <div className="cg-kicker mb-6 w-fit">
            <Zap className="h-3.5 w-3.5" />
            Platform prospek & WhatsApp marketing
          </div>

          <h1 className="max-w-md text-4xl font-black leading-[1.1] text-white">
            Dari scraping lead sampai closing, semua di satu workspace.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
            Gaetin menggabungkan scraping Google Maps, WhatsApp blast, CRM pipeline, dan laporan dalam satu platform operasional yang rapi.
          </p>

          {/* Stats */}
          <div className="mt-8 flex gap-6">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="mt-0.5 text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="mt-8 space-y-2.5">
            {benefits.map((b) => (
              <div key={b} className="flex items-start gap-3 text-sm text-slate-300">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust strip */}
        <div className="relative mt-auto flex items-center gap-6 border-t border-white/[0.07] pt-6 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-primary/50" />
            Data terenkripsi SSL
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary/50" />
            Multi-tenant workspace
          </div>
          <div className="flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-primary/50" />
            Google Maps terintegrasi
          </div>
        </div>
      </section>

      {/* Right panel (form) */}
      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="gradient-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white shadow-glow">
                G
              </span>
              <span className="text-2xl font-black text-white">gaetin</span>
            </Link>
            <p className="mt-2 text-sm text-slate-400">Cari leads. Gaet pelanggan. Tutup deal.</p>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}

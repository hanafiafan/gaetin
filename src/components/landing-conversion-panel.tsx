"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, MousePointerClick, TrendingUp, Users } from "lucide-react";

const useCases = [
  {
    id: "store",
    label: "Toko online",
    description: "Cocok untuk follow-up calon pembeli, promo repeat order, dan balas chat masuk.",
    replyRate: 24,
    closeRate: 11,
    savedHours: 18,
  },
  {
    id: "agency",
    label: "Agency",
    description: "Cocok untuk mengelola banyak client, campaign berbeda, dan laporan performa.",
    replyRate: 31,
    closeRate: 14,
    savedHours: 26,
  },
  {
    id: "sales",
    label: "Tim sales",
    description: "Cocok untuk distribusi lead, follow-up terjadwal, dan pantau deal sampai closing.",
    replyRate: 28,
    closeRate: 16,
    savedHours: 22,
  },
];

const contactVolumes = [500, 2500, 10000];

export default function LandingConversionPanel() {
  const [selectedUseCase, setSelectedUseCase] = useState(useCases[0]);
  const [contacts, setContacts] = useState(contactVolumes[1]);

  const projection = useMemo(() => {
    const replies = Math.round((contacts * selectedUseCase.replyRate) / 100);
    const deals = Math.max(1, Math.round((replies * selectedUseCase.closeRate) / 100));
    const followUps = Math.round(contacts * 0.42);

    return { replies, deals, followUps };
  }, [contacts, selectedUseCase]);

  return (
    <div className="cg-card-strong overflow-hidden rounded-[2rem]">
      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <div className="cg-kicker">
            <MousePointerClick className="h-4 w-4" />
            Simulasi cepat
          </div>
          <h2 className="mt-5 text-3xl font-black text-white sm:text-4xl">
            Lihat gambaran hasil sebelum mencoba dashboard.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Pilih tipe bisnis dan jumlah kontak. Gaetin akan memberi gambaran percakapan, follow-up, dan potensi deal yang bisa kamu pantau.
          </p>

          <div className="mt-7 space-y-3">
            {useCases.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedUseCase(item)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                  selectedUseCase.id === item.id
                    ? "border-primary/50 bg-primary/15 text-white shadow-glow"
                    : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-primary/30 hover:bg-white/[0.07]"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-bold">{item.label}</span>
                  {selectedUseCase.id === item.id ? <CheckCircle2 className="h-4 w-4 text-primary" /> : null}
                </span>
                <span className="mt-2 block text-sm leading-6 text-slate-400">{item.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white">Jumlah kontak aktif</p>
              <p className="mt-1 text-xs text-slate-400">Pilih perkiraan kontak yang ingin kamu kelola.</p>
            </div>
            <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1">
              {contactVolumes.map((volume) => (
                <button
                  key={volume}
                  type="button"
                  onClick={() => setContacts(volume)}
                  className={`rounded-full px-3 py-2 text-xs font-bold transition sm:px-4 ${
                    contacts === volume ? "gradient-primary text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {volume.toLocaleString("id-ID")}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Balasan masuk", value: projection.replies.toLocaleString("id-ID"), icon: TrendingUp },
              { label: "Follow-up terjadwal", value: projection.followUps.toLocaleString("id-ID"), icon: Users },
              { label: "Potensi deal", value: projection.deals.toLocaleString("id-ID"), icon: CheckCircle2 },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-5 text-3xl font-black text-white">{item.value}</p>
                  <p className="mt-2 text-xs font-medium text-slate-400">{item.label}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-3xl border border-primary/25 bg-primary/10 p-5">
            <p className="text-sm font-bold text-white">Yang bisa langsung kamu lakukan</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Import kontak dan beri segmentasi",
                "Kirim blast dengan jeda aman",
                "Jadwalkan follow-up otomatis",
                "Pantau balasan dan closing",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/register"
            className="cg-button-glow gradient-primary mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-white transition hover:scale-[1.01]"
          >
            Coba dengan kontakmu
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

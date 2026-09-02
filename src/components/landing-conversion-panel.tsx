"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";

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
    <div className="grid border border-foreground lg:grid-cols-[0.9fr_1.1fr]">
      <div className="border-b border-foreground p-6 sm:p-8 lg:border-b-0 lg:border-r">
        <span className="cg-kicker">Simulasi cepat</span>
        <h3 className="cg-display mt-5 text-3xl">Pilih tipe bisnis</h3>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Pilih tipe bisnis dan jumlah kontak. Hellens akan memberi gambaran percakapan,
          follow-up, dan potensi deal yang bisa kamu pantau.
        </p>

        <div className="mt-7 border-t border-border">
          {useCases.map((item) => {
            const active = selectedUseCase.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedUseCase(item)}
                className={`w-full border-b border-border px-4 py-4 text-left transition ${
                  active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="cg-label">{item.label}</span>
                  {active && <Check className="h-4 w-4" strokeWidth={3} />}
                </span>
                <span className={`mt-2 block text-sm leading-6 ${active ? "opacity-80" : "text-muted-foreground"}`}>
                  {item.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="cg-label">Jumlah kontak aktif</p>
            <p className="mt-2 text-xs text-muted-foreground">Pilih perkiraan kontak yang ingin kamu kelola.</p>
          </div>
          <div className="flex border border-foreground">
            {contactVolumes.map((volume) => (
              <button
                key={volume}
                type="button"
                onClick={() => setContacts(volume)}
                className={`cg-label px-3 py-2.5 transition sm:px-4 ${
                  contacts === volume
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {volume.toLocaleString("id-ID")}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid border-t border-foreground sm:grid-cols-3">
          {[
            { label: "Balasan masuk", value: projection.replies.toLocaleString("id-ID") },
            { label: "Follow-up terjadwal", value: projection.followUps.toLocaleString("id-ID") },
            { label: "Potensi deal", value: projection.deals.toLocaleString("id-ID") },
          ].map((item, i) => (
            <div key={item.label} className={`py-6 sm:px-5 sm:first:pl-0 ${i > 0 ? "sm:border-l sm:border-border" : ""}`}>
              <p className="cg-display text-4xl">{item.value}</p>
              <p className="cg-label mt-2 text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6">
          <p className="cg-label">Yang bisa langsung kamu lakukan</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Import kontak dan beri segmentasi",
              "Kirim blast dengan jeda aman",
              "Jadwalkan follow-up otomatis",
              "Pantau balasan dan closing",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                <Check className="h-4 w-4 shrink-0 text-foreground" strokeWidth={3} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/register"
          className="cg-label mt-8 flex items-center justify-between gap-2 bg-foreground px-5 py-4 text-background transition hover:bg-primary hover:text-primary-foreground"
        >
          Coba dengan kontakmu
          <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}

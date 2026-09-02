"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Lock, X } from "lucide-react";

const LOCKED_FEATURES = [
  "WhatsApp multi-nomor",
  "Blast & Campaign pesan",
  "CRM Pipeline & Follow-up otomatis",
  "Inbox & manajemen percakapan",
  "Validasi nomor WhatsApp",
  "2.000–6.000 kredit/bulan",
];

/** Shared across Sidebar (desktop) and MobileNav — was previously copy-pasted in both. */
export default function UpgradeModal({ feature, onClose }: { feature: string | null; onClose: () => void }) {
  const router = useRouter();
  if (!feature) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
            <Lock className="h-6 w-6" />
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-6">
          <h2 className="text-xl font-black text-foreground">{feature} butuh paket Bisnis</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Paket Starter hanya mencakup scraping Google Maps dan ekspor CSV. Upgrade ke Bisnis untuk membuka fitur ini.
          </p>

          <div className="mt-5 space-y-2">
            {LOCKED_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-foreground/80">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-[9px] font-black">✓</span>
                {f}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-primary/25 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">Paket Bisnis</p>
                <p className="text-xs text-muted-foreground">Mulai dari</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-foreground">Rp199K</p>
                <p className="text-xs text-muted-foreground">/bulan</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => { router.push("/dashboard/billing"); onClose(); }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            Upgrade Sekarang
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="mt-2 w-full rounded-full py-2.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            Nanti saja
          </button>
        </div>
      </div>
    </div>
  );
}

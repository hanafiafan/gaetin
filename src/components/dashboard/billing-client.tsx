"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  CreditCard,
  ExternalLink,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan { id: string; name: string; monthlyPrice: number; monthlyCredits: number }
interface Pack { id: string; credits: number; price: number }
interface PlansData { plans: Plan[]; topupPacks: Pack[]; yearlyDiscount: number }
interface Me { plan: string; status: string; currentPeriodEnd: string | null; trialEndsAt: string | null; credits: number }
interface Tx { id: string; kind: string; plan: string | null; credits: number; grossAmount: number; status: string; invoiceUrl: string | null; createdAt: string }

function idr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const PLAN_MAX_CREDITS: Record<string, number> = { STARTER: 100, GROWTH: 2000, PRO: 6000 };
const PLAN_FEATURES: Record<string, string[]> = {
  STARTER: [
    "100 kredit trial",
    "20 scraper jobs/bulan",
    "Radius scraping 5 km",
    "100 lead per job",
    "CRM pipeline & Inbox",
    "Blast & kampanye pesan",
  ],
  GROWTH: [
    "2.000 kredit/bulan",
    "250 scraper jobs/bulan",
    "Radius scraping 15 km",
    "500 lead per job",
    "Follow-up otomatis",
    "Bantuan prioritas",
  ],
  PRO: [
    "6.000 kredit/bulan",
    "1.000 scraper jobs/bulan",
    "Radius scraping 20 km",
    "1.500 lead per job",
    "White-label & branding",
    "Support prioritas VIP",
  ],
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Aktif", color: "bg-emerald-500/15 text-emerald-400" },
  TRIAL: { label: "Trial", color: "bg-amber-500/15 text-amber-400" },
  EXPIRED: { label: "Kedaluwarsa", color: "bg-red-500/15 text-red-400" },
  CANCELLED: { label: "Dibatalkan", color: "bg-slate-500/15 text-muted-foreground" },
};
const TX_STATUS: Record<string, { label: string; color: string }> = {
  PAID: { label: "Lunas", color: "bg-emerald-500/15 text-emerald-400" },
  PENDING: { label: "Menunggu", color: "bg-amber-500/15 text-amber-400" },
  EXPIRED: { label: "Kedaluwarsa", color: "bg-red-500/15 text-red-400" },
  FAILED: { label: "Gagal", color: "bg-red-500/15 text-red-400" },
};

function StatusBadge({ status, map }: { status: string; map: typeof STATUS_LABELS }) {
  const s = map[status] ?? { label: status, color: "bg-slate-500/15 text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", s.color)}>
      {s.label}
    </span>
  );
}

export default function BillingClient() {
  const [me, setMe] = useState<Me | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [data, setData] = useState<PlansData | null>(null);
  const [cycle, setCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [rm, rt, rp] = await Promise.all([
      fetch("/api/billing/me"),
      fetch("/api/billing/transactions"),
      fetch("/api/plans"),
    ]);
    const [jm, jt, jp] = await Promise.all([rm.json(), rt.json(), rp.json()]);
    if (jm.success) setMe(jm.data);
    if (jt.success) setTxs(jt.data);
    if (jp.success) setData(jp.data);
  }
  useEffect(() => { load(); }, []);

  async function choose(plan: string) {
    setBusy(true);
    const r = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, cycle }),
    });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) return alert(j?.error?.message ?? "Gagal");
    if (j.data.free) { alert("Paket gratis diaktifkan."); load(); }
    else if (j.data.invoiceUrl) window.location.href = j.data.invoiceUrl;
  }

  async function topup(packId: string) {
    setBusy(true);
    const r = await fetch("/api/billing/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packId }),
    });
    const j = await r.json();
    setBusy(false);
    if (j.success && j.data.invoiceUrl) window.location.href = j.data.invoiceUrl;
    else alert(j?.error?.message ?? "Gagal");
  }

  const price = (p: Plan) =>
    !data ? 0 : cycle === "MONTHLY" ? p.monthlyPrice : Math.round(p.monthlyPrice * 12 * (1 - data.yearlyDiscount));
  const planName = (id: string) => data?.plans.find((p) => p.id === id)?.name ?? id;
  const maxCredits = me ? (PLAN_MAX_CREDITS[me.plan] ?? 100) : 100;
  const creditPct = me ? Math.min(100, Math.round((me.credits / maxCredits) * 100)) : 0;
  const isTrial = me?.status === "TRIAL";
  const isLow = me ? me.credits < 50 : false;

  return (
    <div className="space-y-7">
      {/* Trial banner */}
      {isTrial && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="font-bold text-amber-300 text-sm">Anda sedang dalam masa trial</p>
            <p className="mt-0.5 text-xs text-amber-400/80">
              {me?.trialEndsAt
                ? `Trial berakhir ${new Date(me.trialEndsAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}. `
                : ""}
              Pilih paket berbayar agar akses tidak terputus.
            </p>
          </div>
        </div>
      )}

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="cg-card rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Paket aktif</p>
          <p className="mt-2 text-2xl font-black text-foreground">{me ? planName(me.plan) : "—"}</p>
        </div>
        <div className="cg-card rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Status</p>
          <div className="mt-2">
            {me ? <StatusBadge status={me.status} map={STATUS_LABELS} /> : <span className="text-sm text-muted-foreground">—</span>}
          </div>
        </div>
        <div className={cn("rounded-2xl border p-5 transition", isLow ? "border-amber-500/30 bg-amber-500/10" : "cg-card")}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Saldo kredit</p>
            {isLow && <Zap className="h-4 w-4 text-amber-400" />}
          </div>
          <p className={cn("mt-2 text-2xl font-black", isLow ? "text-amber-300" : "text-foreground")}>
            {me ? me.credits.toLocaleString("id-ID") : "—"}
          </p>
          {me && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10">
              <div
                className={cn("h-full rounded-full transition-all", isLow ? "bg-amber-400" : "gradient-primary")}
                style={{ width: `${creditPct}%` }}
              />
            </div>
          )}
        </div>
        <div className="cg-card rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Berlaku sampai</p>
          <p className="mt-2 text-lg font-black text-foreground">
            {me?.currentPeriodEnd
              ? new Date(me.currentPeriodEnd).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
              : me?.trialEndsAt
              ? new Date(me.trialEndsAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
              : "—"}
          </p>
        </div>
      </div>

      {/* Plan selector */}
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-foreground">Pilih paket</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Upgrade atau downgrade kapan saja. Bayar via VA, e-wallet, atau QRIS.</p>
          </div>
          <div className="flex rounded-full border border-border bg-card p-1 text-sm">
            <button
              onClick={() => setCycle("MONTHLY")}
              className={cn("rounded-full px-4 py-1.5 font-bold transition", cycle === "MONTHLY" ? "gradient-primary text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              Bulanan
            </button>
            <button
              onClick={() => setCycle("YEARLY")}
              className={cn("rounded-full px-4 py-1.5 font-bold transition", cycle === "YEARLY" ? "gradient-primary text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              Tahunan
              {data && <span className="ml-2 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-black text-emerald-400">-{Math.round(data.yearlyDiscount * 100)}%</span>}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(data?.plans ?? [{id:"STARTER",name:"Starter",monthlyPrice:0,monthlyCredits:100},{id:"GROWTH",name:"Bisnis",monthlyPrice:199000,monthlyCredits:2000},{id:"PRO",name:"Pro",monthlyPrice:499000,monthlyCredits:6000}]).map((p) => {
            const current = me?.plan === p.id;
            const amount = data ? price(p) : p.monthlyPrice;
            const featured = p.id === "GROWTH";
            const features = PLAN_FEATURES[p.id] ?? [];
            return (
              <div
                key={p.id}
                className={cn(
                  "relative flex flex-col rounded-3xl border p-6 transition",
                  featured
                    ? "border-primary/40 bg-primary/10 shadow-glow"
                    : current
                    ? "border-primary/30 bg-card"
                    : "border-border bg-muted/50 hover:border-white/20"
                )}
              >
                {featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="gradient-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black text-foreground shadow-sm">
                      <Sparkles className="h-3 w-3" /> Paling populer
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-muted-foreground">{p.name}</p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-3xl font-black text-foreground">
                      {amount === 0 ? "Gratis" : idr(amount)}
                    </span>
                    {amount > 0 && (
                      <span className="mb-0.5 text-sm text-muted-foreground">
                        {cycle === "YEARLY" ? "/tahun" : "/bulan"}
                      </span>
                    )}
                  </div>
                  {cycle === "YEARLY" && amount > 0 && data && (
                    <p className="mt-0.5 text-xs text-emerald-400">
                      Hemat {idr(Math.round(p.monthlyPrice * 12 * data.yearlyDiscount))} vs bulanan
                    </p>
                  )}
                </div>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full", featured ? "bg-primary/20" : "bg-foreground/10")}>
                        <Check className={cn("h-2.5 w-2.5", featured ? "text-primary" : "text-muted-foreground")} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={busy || current}
                  onClick={() => choose(p.id)}
                  className={cn(
                    "mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-bold transition",
                    current
                      ? "border border-border bg-muted text-muted-foreground cursor-not-allowed"
                      : featured
                      ? "gradient-primary cg-button-glow text-foreground hover:opacity-90"
                      : "border border-border bg-muted text-foreground hover:border-primary/40 hover:bg-primary/15"
                  )}
                >
                  <CreditCard className="h-4 w-4" />
                  {current ? "Paket aktif" : amount === 0 ? "Aktifkan gratis" : "Pilih paket"}
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          Pembayaran diamankan oleh Xendit. Tidak perlu kartu kredit untuk paket Starter.
        </p>
      </div>

      {/* Top-up */}
      <div>
        <div className="mb-5">
          <h2 className="text-lg font-black text-foreground">Top-up kredit</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Beli kredit tambahan kapan saja, langsung aktif setelah pembayaran.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {(data?.topupPacks ?? [
            { id: "credit_1000", credits: 1000, price: 100000 },
            { id: "credit_5000", credits: 5000, price: 450000 },
            { id: "credit_10000", credits: 10000, price: 800000 },
          ]).map((pack, i) => {
            const ppc = Math.round(pack.price / pack.credits);
            const cheapest = i === (data?.topupPacks?.length ?? 3) - 1;
            return (
              <div key={pack.id} className={cn("relative rounded-2xl border p-5 transition", cheapest ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/50 hover:border-white/20")}>
                {cheapest && (
                  <span className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-black text-emerald-400">
                    <TrendingUp className="h-3 w-3" /> Terbaik
                  </span>
                )}
                <p className="text-2xl font-black text-foreground">{pack.credits.toLocaleString("id-ID")}</p>
                <p className="mt-0.5 text-sm font-bold text-muted-foreground">kredit</p>
                <p className="mt-3 text-xl font-black text-foreground">{idr(pack.price)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{idr(ppc)}/kredit</p>
                <button
                  disabled={busy}
                  onClick={() => topup(pack.id)}
                  className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-full border border-border bg-muted text-sm font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/15 disabled:opacity-50"
                >
                  <Wallet className="h-4 w-4" />
                  Beli
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <div className="mb-5">
          <h2 className="text-lg font-black text-foreground">Riwayat transaksi</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Semua pembayaran dan top-up kredit tercatat di sini.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Tanggal", "Jenis", "Nominal", "Status", ""].map((h) => (
                    <th key={h} className={cn("p-4 text-left text-xs font-bold uppercase text-muted-foreground", h === "Nominal" && "text-right")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-muted-foreground">
                      <Wallet className="mx-auto mb-2 h-8 w-8 text-slate-700" />
                      Belum ada transaksi.
                    </td>
                  </tr>
                ) : (
                  txs.map((t) => (
                    <tr key={t.id} className="border-b border-border/50 last:border-0 hover:bg-card">
                      <td className="p-4 text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="p-4 font-medium text-foreground">
                        {t.kind === "TOPUP"
                          ? `Top-up ${t.credits.toLocaleString("id-ID")} kredit`
                          : `Langganan ${t.plan ?? ""}`}
                      </td>
                      <td className="p-4 text-right font-bold text-foreground">{idr(t.grossAmount)}</td>
                      <td className="p-4">
                        <StatusBadge status={t.status} map={TX_STATUS} />
                      </td>
                      <td className="p-4 text-right">
                        {t.status === "PENDING" && t.invoiceUrl && (
                          <a
                            href={t.invoiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                          >
                            Bayar sekarang <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

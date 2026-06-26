"use client";

import { useEffect, useState } from "react";
import { CreditCard, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Plan { id: string; name: string; monthlyPrice: number; monthlyCredits: number }
interface Pack { id: string; credits: number; price: number }
interface PlansData { plans: Plan[]; topupPacks: Pack[]; yearlyDiscount: number }
interface Me { plan: string; status: string; currentPeriodEnd: string | null; trialEndsAt: string | null; credits: number }
interface Tx { id: string; kind: string; plan: string | null; credits: number; grossAmount: number; status: string; invoiceUrl: string | null; createdAt: string }

function idr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
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
  useEffect(() => {
    load();
  }, []);

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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm"><CardContent className="p-5"><div className="text-sm text-muted-foreground">Paket</div><div className="mt-1 text-2xl font-semibold">{me ? planName(me.plan) : "-"}</div></CardContent></Card>
        <Card className="rounded-2xl shadow-sm"><CardContent className="p-5"><div className="text-sm text-muted-foreground">Status</div><div className="mt-2"><Badge>{me?.status ?? "-"}</Badge></div></CardContent></Card>
        <Card className="rounded-2xl shadow-sm"><CardContent className="p-5"><div className="text-sm text-muted-foreground">Saldo kredit</div><div className="mt-1 text-2xl font-semibold">{me ? me.credits.toLocaleString("id-ID") : "-"}</div></CardContent></Card>
        <Card className="rounded-2xl shadow-sm"><CardContent className="p-5"><div className="text-sm text-muted-foreground">Berlaku s/d</div><div className="mt-1 text-lg font-semibold">{me?.currentPeriodEnd ? new Date(me.currentPeriodEnd).toLocaleDateString("id-ID") : me?.trialEndsAt ? `Trial ${new Date(me.trialEndsAt).toLocaleDateString("id-ID")}` : "-"}</div></CardContent></Card>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Pilih paket</h2>
          <div className="flex gap-1 rounded-md border p-1 text-sm">
            <button onClick={() => setCycle("MONTHLY")} className={cn("rounded px-3 py-1", cycle === "MONTHLY" && "bg-primary text-primary-foreground")}>Bulanan</button>
            <button onClick={() => setCycle("YEARLY")} className={cn("rounded px-3 py-1", cycle === "YEARLY" && "bg-primary text-primary-foreground")}>Tahunan</button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(data?.plans ?? []).map((p) => {
            const current = me?.plan === p.id;
            const amount = price(p);
            return (
              <Card key={p.id} className={cn("rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md", current && "border-primary")}>
                <CardContent className="space-y-3 p-5">
                  <div className="text-lg font-semibold">{p.name}</div>
                  <div className="text-2xl font-bold">{amount === 0 ? "Gratis" : idr(amount)}<span className="text-sm font-normal text-muted-foreground">{amount > 0 ? (cycle === "YEARLY" ? "/tahun" : "/bulan") : ""}</span></div>
                  <div className="text-sm text-muted-foreground">{p.monthlyCredits.toLocaleString("id-ID")} kredit/bulan</div>
                  <Button className="w-full rounded-full" disabled={busy || current} onClick={() => choose(p.id)}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {current ? "Paket aktif" : amount === 0 ? "Aktifkan" : "Pilih"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-medium">Top-up kredit</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(data?.topupPacks ?? []).map((pack) => (
            <Card key={pack.id} className="rounded-2xl shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <div className="text-lg font-semibold">{pack.credits.toLocaleString("id-ID")} kredit</div>
                  <div className="text-sm text-muted-foreground">{idr(pack.price)}</div>
                </div>
                <Button variant="outline" disabled={busy} onClick={() => topup(pack.id)}>
                  <WalletCards className="mr-2 h-4 w-4" />
                  Beli
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-medium">Riwayat transaksi</h2>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-3">Tanggal</th><th className="p-3">Jenis</th><th className="p-3 text-right">Nominal</th><th className="p-3">Status</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="p-3 text-muted-foreground">{new Date(t.createdAt).toLocaleDateString("id-ID")}</td>
                  <td className="p-3">{t.kind === "TOPUP" ? `Top-up ${t.credits.toLocaleString("id-ID")} kredit` : `Langganan ${t.plan ?? ""}`}</td>
                  <td className="p-3 text-right">{idr(t.grossAmount)}</td>
                  <td className="p-3">{t.status}</td>
                  <td className="p-3 text-right">{t.status === "PENDING" && t.invoiceUrl && <a href={t.invoiceUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Bayar</a>}</td>
                </tr>
              ))}
              {txs.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Belum ada transaksi.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

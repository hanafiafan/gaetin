"use client";

import { useEffect, useState } from "react";

interface PlanLimits {
  scraperJobsPerMonth: number;
  scraperMaxRadiusKm: number;
  scraperMaxResultsPerJob: number;
  saveLeadBatchLimit: number;
  campaignDailyLimit: number;
}
interface Plan { id: string; name: string; monthlyPrice: number; monthlyCredits: number; limits: PlanLimits }
interface Pack { id: string; credits: number; price: number }

const INPUT_CLASS = "h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none";
const LABEL_CLASS = "text-xs text-slate-400";

export default function AdminPlansEditor() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [yearlyDiscount, setYearlyDiscount] = useState(0.2);
  const [packsJson, setPacksJson] = useState("[]");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/admin/cms/plans");
      const j = await r.json();
      if (j.success) {
        setPlans(j.data.plans);
        setYearlyDiscount(j.data.yearlyDiscount);
        setPacksJson(JSON.stringify(j.data.topupPacks, null, 2));
      }
    })();
  }, []);

  function update(id: string, field: keyof Plan, value: string) {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: field === "name" ? value : Number(value) } : p)));
  }
  function updateLimit(id: string, field: keyof PlanLimits, value: string) {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, limits: { ...p.limits, [field]: Number(value) } } : p)),
    );
  }

  async function save() {
    setError(null);
    setSaved(false);
    let topupPacks: Pack[];
    try {
      topupPacks = JSON.parse(packsJson);
    } catch {
      setError("Format JSON top-up tidak valid.");
      return;
    }
    const r = await fetch("/api/admin/cms/plans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plans, topupPacks, yearlyDiscount: Number(yearlyDiscount) }),
    });
    const j = await r.json();
    if (!r.ok) { setError(j?.error?.message ?? "Gagal menyimpan"); return; }
    setSaved(true);
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="space-y-3">
        {plans.map((p) => (
          <div key={p.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="mb-2 text-sm font-bold text-slate-400">{p.id}</div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <label className={LABEL_CLASS}>Nama</label>
                <input value={p.name} onChange={(e) => update(p.id, "name", e.target.value)} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Harga/bulan (IDR)</label>
                <input type="number" value={p.monthlyPrice} onChange={(e) => update(p.id, "monthlyPrice", e.target.value)} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Kredit/bulan</label>
                <input type="number" value={p.monthlyCredits} onChange={(e) => update(p.id, "monthlyCredits", e.target.value)} className={INPUT_CLASS} />
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-5">
              <div>
                <label className={LABEL_CLASS}>Job scraper/bln</label>
                <input type="number" value={p.limits.scraperJobsPerMonth} onChange={(e) => updateLimit(p.id, "scraperJobsPerMonth", e.target.value)} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Radius maks. km</label>
                <input type="number" value={p.limits.scraperMaxRadiusKm} onChange={(e) => updateLimit(p.id, "scraperMaxRadiusKm", e.target.value)} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Hasil/job</label>
                <input type="number" value={p.limits.scraperMaxResultsPerJob} onChange={(e) => updateLimit(p.id, "scraperMaxResultsPerJob", e.target.value)} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Save/batch</label>
                <input type="number" value={p.limits.saveLeadBatchLimit} onChange={(e) => updateLimit(p.id, "saveLeadBatchLimit", e.target.value)} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Campaign/hari</label>
                <input type="number" value={p.limits.campaignDailyLimit} onChange={(e) => updateLimit(p.id, "campaignDailyLimit", e.target.value)} className={INPUT_CLASS} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-bold text-white">Diskon tahunan (0–0.9):</label>
        <input type="number" step="0.05" min="0" max="0.9" value={yearlyDiscount} onChange={(e) => setYearlyDiscount(Number(e.target.value))} className="h-10 w-28 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white focus:border-primary/40 focus:outline-none" />
        <span className="text-sm text-slate-400">= {Math.round(yearlyDiscount * 100)}%</span>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-white">
          Paket top-up (JSON: [{'{'}&#34;id&#34;: &#34;...&#34;, &#34;credits&#34;: 1000, &#34;price&#34;: 100000{'}'}])
        </label>
        <textarea
          value={packsJson}
          onChange={(e) => setPacksJson(e.target.value)}
          rows={8}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 font-mono text-xs text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none"
        />
      </div>

      {error && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {saved && <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">Tersimpan. Harga berlaku di landing &amp; billing.</div>}
      <button onClick={save} className="flex h-10 items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-5 text-sm font-bold text-primary transition hover:bg-primary/25">
        Simpan paket
      </button>
    </div>
  );
}

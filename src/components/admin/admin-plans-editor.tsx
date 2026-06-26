"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PlanLimits {
  scraperJobsPerMonth: number;
  scraperMaxRadiusKm: number;
  scraperMaxResultsPerJob: number;
  saveLeadBatchLimit: number;
  campaignDailyLimit: number;
}
interface Plan { id: string; name: string; monthlyPrice: number; monthlyCredits: number; limits: PlanLimits }
interface Pack { id: string; credits: number; price: number }

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
    if (!r.ok) {
      setError(j?.error?.message ?? "Gagal menyimpan");
      return;
    }
    setSaved(true);
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="space-y-3">
        {plans.map((p) => (
          <div key={p.id} className="rounded-lg border bg-card p-4">
            <div className="mb-2 text-sm font-medium text-muted-foreground">{p.id}</div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <label className="text-xs text-muted-foreground">Nama</label>
                <Input value={p.name} onChange={(e) => update(p.id, "name", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Harga/bulan (IDR)</label>
                <Input type="number" value={p.monthlyPrice} onChange={(e) => update(p.id, "monthlyPrice", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Kredit/bulan</label>
                <Input type="number" value={p.monthlyCredits} onChange={(e) => update(p.id, "monthlyCredits", e.target.value)} />
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-5">
              <div>
                <label className="text-xs text-muted-foreground">Job scraper/bln</label>
                <Input type="number" value={p.limits.scraperJobsPerMonth} onChange={(e) => updateLimit(p.id, "scraperJobsPerMonth", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Radius maks. km</label>
                <Input type="number" value={p.limits.scraperMaxRadiusKm} onChange={(e) => updateLimit(p.id, "scraperMaxRadiusKm", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Hasil/job</label>
                <Input type="number" value={p.limits.scraperMaxResultsPerJob} onChange={(e) => updateLimit(p.id, "scraperMaxResultsPerJob", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Save/batch</label>
                <Input type="number" value={p.limits.saveLeadBatchLimit} onChange={(e) => updateLimit(p.id, "saveLeadBatchLimit", e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Campaign/hari</label>
                <Input type="number" value={p.limits.campaignDailyLimit} onChange={(e) => updateLimit(p.id, "campaignDailyLimit", e.target.value)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Diskon tahunan (0–0.9):</label>
        <Input type="number" step="0.05" min="0" max="0.9" value={yearlyDiscount} onChange={(e) => setYearlyDiscount(Number(e.target.value))} className="w-28" />
        <span className="text-sm text-muted-foreground">= {Math.round(yearlyDiscount * 100)}%</span>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Paket top-up (JSON: [{'{ "id": "...", "credits": 1000, "price": 100000 }'}])</label>
        <textarea value={packsJson} onChange={(e) => setPacksJson(e.target.value)} rows={8} className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs" />
      </div>

      {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {saved && <div className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600">Tersimpan. Harga berlaku di landing & billing.</div>}
      <Button onClick={save}>Simpan paket</Button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  Database,
  Image,
  Loader2,
  Plus,
  Save,
  Search,
  Target,
  ToggleLeft,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OwnerCmsSettings {
  featureFlags: Record<string, boolean>;
  mediaAssets: Record<string, string>;
  customerFields: { key: string; label: string; enabled: boolean }[];
  experiments: { key: string; name: string; enabled: boolean; audience: string }[];
}

interface CustomerRow {
  id: string;
  workspace: string;
  ownerName: string;
  ownerEmail: string;
  plan: string;
  status: string;
  billingCycle: string;
  credits: number;
  revenue: number;
  activityScore: number;
  usage: Record<string, number>;
  health: "healthy" | "watch" | "growth" | "risk";
  needs: string[];
  upgradeCandidate: boolean;
}

interface CustomerIntelligence {
  summary: {
    totalCustomers: number;
    activeCustomers: number;
    newCustomers30d: number;
    mrrEstimate: number;
    paidRevenue: number;
    monthlyRevenue: number;
    creditsUsed: number;
    monthlyCreditsUsed: number;
    avgContacts: number;
    avgActivityScore: number;
    totalLeads: number;
    totalCampaigns: number;
    churnRiskCount: number;
    upgradeCandidateCount: number;
    lowCreditCount: number;
  };
  planDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  featureUsage: Record<string, number>;
  marketSignals: {
    topLeadCategories: { label: string; count: number }[];
    topContactCategories: { label: string; count: number }[];
    topScraperKeywords: { label: string; count: number }[];
  };
  customers: CustomerRow[];
  actionQueues: {
    lowCredits: CustomerRow[];
    upgradeCandidates: CustomerRow[];
    churnRisks: CustomerRow[];
    onboardingNeeded: CustomerRow[];
  };
  topCustomers: CustomerRow[];
}

function idr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function labelize(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

function healthLabel(health: CustomerRow["health"]) {
  if (health === "risk") return "Risiko";
  if (health === "growth") return "Growth";
  if (health === "watch") return "Pantau";
  return "Sehat";
}

function healthClass(health: CustomerRow["health"]) {
  if (health === "risk") return "border-red-500/30 bg-red-500/10 text-red-400";
  if (health === "growth") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  if (health === "watch") return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  return "border-primary/30 bg-primary/10 text-primary";
}

const INPUT_CLASS = "h-9 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none";
const SECTION_CARD = "cg-card rounded-2xl p-5";
const SECTION_TITLE = "mb-4 flex items-center gap-2 text-base font-bold text-white";

export default function OwnerCmsControl() {
  const [settings, setSettings] = useState<OwnerCmsSettings | null>(null);
  const [intelligence, setIntelligence] = useState<CustomerIntelligence | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const [settingsRes, intelRes] = await Promise.all([
        fetch("/api/admin/cms/control-center"),
        fetch("/api/admin/customer-intelligence"),
      ]);
      const [settingsJson, intelJson] = await Promise.all([settingsRes.json(), intelRes.json()]);
      if (settingsJson.success) setSettings(settingsJson.data);
      if (intelJson.success) setIntelligence(intelJson.data);
    })();
  }, []);

  function toggleFlag(key: string) {
    setSettings((prev) => prev ? { ...prev, featureFlags: { ...prev.featureFlags, [key]: !prev.featureFlags[key] } } : prev);
  }
  function updateAsset(key: string, value: string) {
    setSettings((prev) => prev ? { ...prev, mediaAssets: { ...prev.mediaAssets, [key]: value } } : prev);
  }
  function updateCustomerField(index: number, field: "key" | "label" | "enabled", value: string | boolean) {
    setSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, customerFields: prev.customerFields.map((item, i) => i === index ? { ...item, [field]: value } : item) };
    });
  }
  function addCustomerField() {
    setSettings((prev) => prev ? { ...prev, customerFields: [...prev.customerFields, { key: `custom_${prev.customerFields.length + 1}`, label: "Field baru", enabled: true }] } : prev);
  }
  function removeCustomerField(index: number) {
    setSettings((prev) => prev ? { ...prev, customerFields: prev.customerFields.filter((_, i) => i !== index) } : prev);
  }
  function updateExperiment(index: number, field: "key" | "name" | "enabled" | "audience", value: string | boolean) {
    setSettings((prev) => {
      if (!prev) return prev;
      return { ...prev, experiments: prev.experiments.map((item, i) => i === index ? { ...item, [field]: value } : item) };
    });
  }
  function addExperiment() {
    setSettings((prev) => prev ? { ...prev, experiments: [...prev.experiments, { key: `experiment_${prev.experiments.length + 1}`, name: "Eksperimen baru", enabled: false, audience: "trial" }] } : prev);
  }
  function removeExperiment(index: number) {
    setSettings((prev) => (prev ? { ...prev, experiments: prev.experiments.filter((_, i) => i !== index) } : prev));
  }

  async function save() {
    if (!settings) return;
    setError(null);
    setSaved(false);
    setSaving(true);
    const res = await fetch("/api/admin/cms/control-center", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setError(json?.error?.message ?? "Gagal menyimpan konfigurasi CMS."); return; }
    setSaved(true);
  }

  if (!settings || !intelligence) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm text-slate-400">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Memuat owner CMS...
      </div>
    );
  }

  const summaryCards = [
    { label: "Customer", value: intelligence.summary.totalCustomers.toLocaleString("id-ID"), icon: Users },
    { label: "Customer aktif", value: intelligence.summary.activeCustomers.toLocaleString("id-ID"), icon: BarChart3 },
    { label: "MRR estimasi", value: idr(intelligence.summary.mrrEstimate), icon: TrendingUp },
    { label: "Revenue bulan ini", value: idr(intelligence.summary.monthlyRevenue), icon: CreditCard },
    { label: "Customer baru 30 hari", value: intelligence.summary.newCustomers30d.toLocaleString("id-ID"), icon: Plus },
    { label: "Kandidat upgrade", value: intelligence.summary.upgradeCandidateCount.toLocaleString("id-ID"), icon: Target },
    { label: "Risiko churn", value: intelligence.summary.churnRiskCount.toLocaleString("id-ID"), icon: AlertTriangle },
    { label: "Kredit terpakai/bln", value: intelligence.summary.monthlyCreditsUsed.toLocaleString("id-ID"), icon: Database },
  ];

  const actionSections = [
    { title: "Kandidat Upgrade", icon: Target, rows: intelligence.actionQueues.upgradeCandidates, empty: "Belum ada kandidat upgrade." },
    { title: "Risiko Churn", icon: AlertTriangle, rows: intelligence.actionQueues.churnRisks, empty: "Belum ada customer berisiko." },
    { title: "Kredit Menipis", icon: CreditCard, rows: intelligence.actionQueues.lowCredits, empty: "Saldo kredit customer aman." },
    { title: "Butuh Onboarding", icon: Users, rows: intelligence.actionQueues.onboardingNeeded, empty: "Semua customer sudah mulai aktif." },
  ];

  const signalSections = [
    { title: "Kategori Lead", icon: Search, rows: intelligence.marketSignals.topLeadCategories },
    { title: "Kategori Kontak", icon: Users, rows: intelligence.marketSignals.topContactCategories },
    { title: "Keyword Scraper", icon: Target, rows: intelligence.marketSignals.topScraperKeywords },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="cg-card flex items-center justify-between rounded-xl p-4">
              <div>
                <div className="text-xs font-medium text-slate-400">{card.label}</div>
                <div className="mt-1 text-xl font-bold text-white">{card.value}</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <div className={SECTION_CARD}>
            <p className={SECTION_TITLE}><ToggleLeft className="h-5 w-5 text-primary" />Feature Flags</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(settings.featureFlags).map(([key, enabled]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleFlag(key)}
                  className={cn(
                    "flex min-h-12 items-center justify-between rounded-xl border px-3 text-left text-sm transition-colors",
                    enabled ? "border-primary/40 bg-primary/10 text-primary" : "border-white/[0.08] bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]",
                  )}
                >
                  <span className="font-bold">{labelize(key)}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", enabled ? "bg-primary/20 text-primary" : "bg-white/[0.08] text-slate-500")}>
                    {enabled ? "On" : "Off"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={SECTION_CARD}>
            <p className={SECTION_TITLE}><Image className="h-5 w-5 text-primary" />Asset &amp; Media Registry</p>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(settings.mediaAssets).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-slate-400">{labelize(key)}</label>
                  <input value={value} onChange={(e) => updateAsset(key, e.target.value)} placeholder="https://... atau /uploads/..." className={INPUT_CLASS} />
                </div>
              ))}
            </div>
          </div>

          <div className={SECTION_CARD}>
            <p className={SECTION_TITLE}>Customer Fields &amp; Experiments</p>
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-white">Field Data Client</div>
                    <p className="text-xs text-slate-400">Untuk riset pasar, segmentasi, dan roadmap fitur.</p>
                  </div>
                  <button type="button" onClick={addCustomerField} className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 text-xs font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary">
                    <Plus className="h-3.5 w-3.5" /> Field
                  </button>
                </div>
                <div className="space-y-2">
                  {settings.customerFields.map((field, index) => (
                    <div key={`${field.key}-${index}`} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => updateCustomerField(index, "enabled", !field.enabled)}
                          className={cn("rounded-full px-2.5 py-1 text-xs font-bold", field.enabled ? "bg-primary/10 text-primary" : "bg-white/[0.06] text-slate-500")}
                        >
                          {field.enabled ? "Aktif" : "Nonaktif"}
                        </button>
                        <button type="button" onClick={() => removeCustomerField(index)} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400">Key</label>
                          <input value={field.key} onChange={(e) => updateCustomerField(index, "key", e.target.value)} className={INPUT_CLASS} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400">Label</label>
                          <input value={field.label} onChange={(e) => updateCustomerField(index, "label", e.target.value)} className={INPUT_CLASS} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-white">Eksperimen Produk</div>
                    <p className="text-xs text-slate-400">Kontrol eksperimen pricing, onboarding, dan beta fitur.</p>
                  </div>
                  <button type="button" onClick={addExperiment} className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 text-xs font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary">
                    <Plus className="h-3.5 w-3.5" /> Eksperimen
                  </button>
                </div>
                <div className="space-y-2">
                  {settings.experiments.map((experiment, index) => (
                    <div key={`${experiment.key}-${index}`} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => updateExperiment(index, "enabled", !experiment.enabled)}
                          className={cn("rounded-full px-2.5 py-1 text-xs font-bold", experiment.enabled ? "bg-primary/10 text-primary" : "bg-white/[0.06] text-slate-500")}
                        >
                          {experiment.enabled ? "Aktif" : "Nonaktif"}
                        </button>
                        <button type="button" onClick={() => removeExperiment(index)} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid gap-2">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400">Nama</label>
                          <input value={experiment.name} onChange={(e) => updateExperiment(index, "name", e.target.value)} className={INPUT_CLASS} />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-xs text-slate-400">Key</label>
                            <input value={experiment.key} onChange={(e) => updateExperiment(index, "key", e.target.value)} className={INPUT_CLASS} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-slate-400">Audience</label>
                            <input value={experiment.audience} onChange={(e) => updateExperiment(index, "audience", e.target.value)} className={INPUT_CLASS} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className={SECTION_CARD}>
            <p className={SECTION_TITLE}>Prioritas Tindakan</p>
            <div className="space-y-4">
              {actionSections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.title} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Icon className="h-4 w-4 text-primary" />
                      {section.title}
                    </div>
                    {section.rows.length === 0 && (
                      <div className="rounded-xl border border-dashed border-white/[0.06] p-3 text-xs text-slate-500">
                        {section.empty}
                      </div>
                    )}
                    {section.rows.slice(0, 3).map((customer) => (
                      <div key={`${section.title}-${customer.id}`} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-white">{customer.workspace}</div>
                            <div className="truncate text-xs text-slate-500">{customer.ownerEmail}</div>
                          </div>
                          <span className={cn("whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold", healthClass(customer.health))}>
                            {healthLabel(customer.health)}
                          </span>
                        </div>
                        {customer.needs.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {customer.needs.slice(0, 2).map((need) => (
                              <span key={need} className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] text-slate-400">
                                {need}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={SECTION_CARD}>
            <p className={SECTION_TITLE}>Sinyal Pasar</p>
            <div className="space-y-4">
              {signalSections.map((section) => {
                const Icon = section.icon;
                const top = section.rows[0]?.count ?? 1;
                return (
                  <div key={section.title} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Icon className="h-4 w-4 text-primary" />
                      {section.title}
                    </div>
                    {section.rows.length === 0 && (
                      <div className="rounded-xl border border-dashed border-white/[0.06] p-3 text-xs text-slate-500">
                        Belum ada data.
                      </div>
                    )}
                    {section.rows.slice(0, 5).map((row) => (
                      <div key={`${section.title}-${row.label}`}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="truncate text-slate-300">{row.label}</span>
                          <span className="ml-2 font-bold text-white">{row.count.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, (row.count / top) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={SECTION_CARD}>
            <p className={SECTION_TITLE}>Customer Paling Aktif</p>
            <div className="space-y-2">
              {intelligence.topCustomers.slice(0, 6).map((customer) => (
                <div key={customer.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-white">{customer.workspace}</div>
                      <div className="truncate text-xs text-slate-500">{customer.ownerEmail}</div>
                    </div>
                    <span className="whitespace-nowrap rounded-full border border-white/[0.08] px-2.5 py-1 text-xs text-slate-300">{customer.plan}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-white/[0.04] p-2">
                      <div className="font-bold text-white">{customer.usage.contacts ?? 0}</div>
                      <div className="text-slate-500">Kontak</div>
                    </div>
                    <div className="rounded-lg bg-white/[0.04] p-2">
                      <div className="font-bold text-white">{customer.activityScore}</div>
                      <div className="text-slate-500">Skor</div>
                    </div>
                    <div className="rounded-lg bg-white/[0.04] p-2">
                      <div className="font-bold text-white">{customer.credits}</div>
                      <div className="text-slate-500">Kredit</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
      {saved && <div className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">Konfigurasi owner CMS tersimpan.</div>}
      <div className="sticky bottom-4 z-10 flex justify-end">
        <button onClick={save} disabled={saving} className="flex h-10 items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-5 text-sm font-bold text-primary shadow-lg transition hover:bg-primary/25 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan CMS Control
        </button>
      </div>
    </div>
  );
}

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  if (health === "risk") return "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300";
  if (health === "growth") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
  if (health === "watch") return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300";
  return "border-primary/30 bg-primary/10 text-primary";
}

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
      if (settingsJson.success) {
        setSettings(settingsJson.data);
      }
      if (intelJson.success) setIntelligence(intelJson.data);
    })();
  }, []);

  function toggleFlag(key: string) {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            featureFlags: { ...prev.featureFlags, [key]: !prev.featureFlags[key] },
          }
        : prev,
    );
  }

  function updateAsset(key: string, value: string) {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            mediaAssets: { ...prev.mediaAssets, [key]: value },
          }
        : prev,
    );
  }

  function updateCustomerField(index: number, field: "key" | "label" | "enabled", value: string | boolean) {
    setSettings((prev) => {
      if (!prev) return prev;
      const customerFields = prev.customerFields.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      );
      return { ...prev, customerFields };
    });
  }

  function addCustomerField() {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            customerFields: [
              ...prev.customerFields,
              { key: `custom_${prev.customerFields.length + 1}`, label: "Field baru", enabled: true },
            ],
          }
        : prev,
    );
  }

  function removeCustomerField(index: number) {
    setSettings((prev) =>
      prev ? { ...prev, customerFields: prev.customerFields.filter((_, i) => i !== index) } : prev,
    );
  }

  function updateExperiment(index: number, field: "key" | "name" | "enabled" | "audience", value: string | boolean) {
    setSettings((prev) => {
      if (!prev) return prev;
      const experiments = prev.experiments.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      );
      return { ...prev, experiments };
    });
  }

  function addExperiment() {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            experiments: [
              ...prev.experiments,
              {
                key: `experiment_${prev.experiments.length + 1}`,
                name: "Eksperimen baru",
                enabled: false,
                audience: "trial",
              },
            ],
          }
        : prev,
    );
  }

  function removeExperiment(index: number) {
    setSettings((prev) => (prev ? { ...prev, experiments: prev.experiments.filter((_, i) => i !== index) } : prev));
  }

  async function save() {
    if (!settings) return;
    setError(null);
    setSaved(false);
    setSaving(true);
    const payload = settings;
    const res = await fetch("/api/admin/cms/control-center", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json?.error?.message ?? "Gagal menyimpan konfigurasi CMS.");
      return;
    }
    setSettings(payload);
    setSaved(true);
  }

  if (!settings || !intelligence) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground">
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
    {
      title: "Kandidat Upgrade",
      icon: Target,
      rows: intelligence.actionQueues.upgradeCandidates,
      empty: "Belum ada kandidat upgrade.",
    },
    {
      title: "Risiko Churn",
      icon: AlertTriangle,
      rows: intelligence.actionQueues.churnRisks,
      empty: "Belum ada customer berisiko.",
    },
    {
      title: "Kredit Menipis",
      icon: CreditCard,
      rows: intelligence.actionQueues.lowCredits,
      empty: "Saldo kredit customer aman.",
    },
    {
      title: "Butuh Onboarding",
      icon: Users,
      rows: intelligence.actionQueues.onboardingNeeded,
      empty: "Semua customer sudah mulai aktif.",
    },
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
            <Card key={card.label} className="rounded-xl">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">{card.label}</div>
                  <div className="mt-1 text-xl font-semibold">{card.value}</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ToggleLeft className="h-5 w-5 text-primary" />
                Feature Flags
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(settings.featureFlags).map(([key, enabled]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleFlag(key)}
                  className={cn(
                    "flex min-h-12 items-center justify-between rounded-xl border px-3 text-left text-sm transition-colors",
                    enabled ? "border-primary/40 bg-primary/10 text-primary" : "bg-muted/30 text-muted-foreground hover:bg-muted",
                  )}
                >
                  <span className="font-medium">{labelize(key)}</span>
                  <Badge variant={enabled ? "default" : "outline"}>{enabled ? "On" : "Off"}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Image className="h-5 w-5 text-primary" />
                Asset & Media Registry
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {Object.entries(settings.mediaAssets).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">{labelize(key)}</label>
                  <Input value={value} onChange={(e) => updateAsset(key, e.target.value)} placeholder="https://... atau /uploads/..." />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-base">Customer Fields & Experiments</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Field Data Client</div>
                    <p className="text-xs text-muted-foreground">Untuk riset pasar, segmentasi, dan roadmap fitur.</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={addCustomerField}>
                    <Plus className="mr-2 h-4 w-4" />
                    Field
                  </Button>
                </div>
                <div className="space-y-2">
                  {settings.customerFields.map((field, index) => (
                    <div key={`${field.key}-${index}`} className="rounded-xl border bg-background p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => updateCustomerField(index, "enabled", !field.enabled)}
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            field.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {field.enabled ? "Aktif" : "Nonaktif"}
                        </button>
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeCustomerField(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Key</label>
                          <Input value={field.key} onChange={(e) => updateCustomerField(index, "key", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Label</label>
                          <Input value={field.label} onChange={(e) => updateCustomerField(index, "label", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Eksperimen Produk</div>
                    <p className="text-xs text-muted-foreground">Kontrol eksperimen pricing, onboarding, dan beta fitur.</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={addExperiment}>
                    <Plus className="mr-2 h-4 w-4" />
                    Eksperimen
                  </Button>
                </div>
                <div className="space-y-2">
                  {settings.experiments.map((experiment, index) => (
                    <div key={`${experiment.key}-${index}`} className="rounded-xl border bg-background p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => updateExperiment(index, "enabled", !experiment.enabled)}
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            experiment.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                          )}
                        >
                          {experiment.enabled ? "Aktif" : "Nonaktif"}
                        </button>
                        <Button type="button" size="icon" variant="ghost" onClick={() => removeExperiment(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid gap-2">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Nama</label>
                          <Input value={experiment.name} onChange={(e) => updateExperiment(index, "name", e.target.value)} />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Key</label>
                            <Input value={experiment.key} onChange={(e) => updateExperiment(index, "key", e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Audience</label>
                            <Input value={experiment.audience} onChange={(e) => updateExperiment(index, "audience", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-base">Prioritas Tindakan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {actionSections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.title} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4 text-primary" />
                      {section.title}
                    </div>
                    {section.rows.length === 0 && (
                      <div className="rounded-xl border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
                        {section.empty}
                      </div>
                    )}
                    {section.rows.slice(0, 3).map((customer) => (
                      <div key={`${section.title}-${customer.id}`} className="rounded-xl border bg-background p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">{customer.workspace}</div>
                            <div className="truncate text-xs text-muted-foreground">{customer.ownerEmail}</div>
                          </div>
                          <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", healthClass(customer.health))}>
                            {healthLabel(customer.health)}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {customer.needs.slice(0, 2).map((need) => (
                            <Badge key={need} variant="outline" className="text-[10px]">
                              {need}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-base">Sinyal Pasar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {signalSections.map((section) => {
                const Icon = section.icon;
                const top = section.rows[0]?.count ?? 1;
                return (
                  <div key={section.title} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4 text-primary" />
                      {section.title}
                    </div>
                    {section.rows.length === 0 && (
                      <div className="rounded-xl border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
                        Belum ada data.
                      </div>
                    )}
                    {section.rows.slice(0, 5).map((row) => (
                      <div key={`${section.title}-${row.label}`}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="truncate">{row.label}</span>
                          <span className="font-medium">{row.count.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, (row.count / top) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-base">Customer Paling Aktif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {intelligence.topCustomers.slice(0, 6).map((customer) => (
                <div key={customer.id} className="rounded-xl border bg-background p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{customer.workspace}</div>
                      <div className="truncate text-xs text-muted-foreground">{customer.ownerEmail}</div>
                    </div>
                    <Badge variant="outline">{customer.plan}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="font-semibold">{customer.usage.contacts ?? 0}</div>
                      <div className="text-muted-foreground">Kontak</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="font-semibold">{customer.activityScore}</div>
                      <div className="text-muted-foreground">Skor</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-2">
                      <div className="font-semibold">{customer.credits}</div>
                      <div className="text-muted-foreground">Kredit</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {error && <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
      {saved && <div className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">Konfigurasi owner CMS tersimpan.</div>}
      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button onClick={save} disabled={saving} className="shadow-lg">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Simpan CMS Control
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Activity, BarChart3, CreditCard, Database, Loader2,
  MessageCircle, Radar, RefreshCw, Server, TrendingUp, Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
const PLAN_COLOR: Record<string, string> = { STARTER: "#3b82f6", GROWTH: "#10b981", PRO: "#8b5cf6" };
const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "#10b981", TRIAL: "#f59e0b", EXPIRED: "#ef4444",
  BLOCKED: "#dc2626", CANCELLED: "#6b7280",
  COMPLETED: "#10b981", RUNNING: "#3b82f6", FAILED: "#ef4444", STOPPED: "#6b7280",
  SENT: "#10b981", DRAFT: "#6b7280", SENDING: "#3b82f6",
};
const WA_COLOR: Record<string, string> = { ACTIVE: "#10b981", INACTIVE: "#ef4444", UNKNOWN: "#6b7280" };

interface AnalyticsData {
  timeSeries: {
    workspaces: { date: string; count: number }[];
    leads: { date: string; count: number }[];
    contacts: { date: string; count: number }[];
    credits: { date: string; issued: number; used: number }[];
  };
  distributions: {
    plans: { name: string; value: number }[];
    statuses: { name: string; value: number }[];
    waStatus: { name: string; value: number }[];
    blastStatus: { name: string; value: number }[];
    scraperStatus: { name: string; value: number }[];
  };
  intel: {
    topLeadCategories: { name: string; count: number }[];
    topContactCategories: { name: string; count: number }[];
    topScraperKeywords: { name: string; count: number }[];
  };
  dbStats: { table: string; count: number }[];
  recentActivity: {
    recentLeads: { businessName: string; category: string | null; phone: string | null; createdAt: string; workspace: { name: string } }[];
    recentContacts: { name: string | null; phone: string; waStatus: string; createdAt: string; workspace: { name: string } }[];
    recentBlasts: { name: string | null; status: string; totalRecipients: number; createdAt: string; workspace: { name: string } }[];
  };
  credits: { totalIssued: number; totalUsed: number };
  weeklyActivity: { activeWsThisWeek: number; newLeadsThisWeek: number; newContactsThisWeek: number };
}

const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "growth", label: "Pertumbuhan", icon: TrendingUp },
  { key: "database", label: "Database", icon: Database },
  { key: "activity", label: "Aktivitas", icon: Activity },
] as const;

function fmt(n: number) { return n.toLocaleString("id-ID"); }
function idr(n: number) { return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n); }

function MiniLabel({ x, y, value }: { x?: number; y?: number; value?: number }) {
  if (!value) return null;
  return <text x={x} y={(y ?? 0) - 4} fill="#94a3b8" fontSize={10} textAnchor="middle">{value}</text>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "growth" | "database" | "activity">("overview");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/analytics");
    const j = await r.json();
    if (j.success) setData(j.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
  if (!data) return <div className="text-muted-foreground">Gagal memuat data.</div>;

  const { timeSeries, distributions, intel, dbStats, recentActivity, credits, weeklyActivity } = data;

  const totalLeads = timeSeries.leads.reduce((s, d) => s + d.count, 0);
  const totalContacts = timeSeries.contacts.reduce((s, d) => s + d.count, 0);
  const totalWs = timeSeries.workspaces.reduce((s, d) => s + d.count, 0);
  const dbTotal = dbStats.reduce((s, d) => s + d.count, 0);

  // Merge leads + contacts into one time series
  const mergedTimeSeries = timeSeries.leads.map((l, i) => ({
    date: l.date.slice(5),
    leads: l.count,
    contacts: timeSeries.contacts[i]?.count ?? 0,
    workspaces: timeSeries.workspaces[i]?.count ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Analitik Platform</h1>
          <p className="text-sm text-muted-foreground">Visualisasi data sistem Gaetin secara lengkap.</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Lead 30 hari", value: fmt(totalLeads), icon: Radar, sub: `${fmt(weeklyActivity.newLeadsThisWeek)} minggu ini` },
          { label: "Kontak 30 hari", value: fmt(totalContacts), icon: Users, sub: `${fmt(weeklyActivity.newContactsThisWeek)} minggu ini` },
          { label: "WS Aktif minggu ini", value: fmt(weeklyActivity.activeWsThisWeek), icon: Server, sub: "memiliki lead baru" },
          { label: "Kredit dipakai", value: fmt(credits.totalUsed), icon: CreditCard, sub: `dari ${fmt(credits.totalIssued)} diterbitkan` },
        ].map(c => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <c.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold">{c.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{c.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {/* Plan Distribution */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Distribusi Paket</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={distributions.plans} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {distributions.plans.map((e) => (
                        <Cell key={e.name} fill={PLAN_COLOR[e.name] ?? COLORS[0]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {distributions.plans.map(p => (
                    <span key={p.name} className="flex items-center gap-1 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: PLAN_COLOR[p.name] ?? COLORS[0] }} />
                      {p.name} ({p.value})
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* WA Status */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Status WhatsApp Kontak</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={distributions.waStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                      {distributions.waStatus.map((e) => (
                        <Cell key={e.name} fill={WA_COLOR[e.name] ?? COLORS[2]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {distributions.waStatus.map(w => (
                    <span key={w.name} className="flex items-center gap-1 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: WA_COLOR[w.name] ?? COLORS[2] }} />
                      {w.name} ({fmt(w.value)})
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Status Langganan</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={distributions.statuses} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={70} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {distributions.statuses.map((e) => (
                        <Cell key={e.name} fill={STATUS_COLOR[e.name] ?? COLORS[0]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Scraper + Blast status side by side */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">Status Scraper Jobs</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={distributions.scraperStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {distributions.scraperStatus.map((e) => (
                        <Cell key={e.name} fill={STATUS_COLOR[e.name] ?? COLORS[0]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Status Blast</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={distributions.blastStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {distributions.blastStatus.map((e) => (
                        <Cell key={e.name} fill={STATUS_COLOR[e.name] ?? COLORS[0]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── GROWTH TAB ───────────────────────────────────────────────── */}
      {tab === "growth" && (
        <div className="space-y-6">
          {/* Leads & Contacts trend */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Lead & Kontak Baru — 30 Hari Terakhir</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={mergedTimeSeries} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gLead" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gContact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="leads" name="Lead" stroke="#10b981" fill="url(#gLead)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="contacts" name="Kontak" stroke="#3b82f6" fill="url(#gContact)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Workspace growth */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Workspace Baru — 30 Hari Terakhir</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={timeSeries.workspaces} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => v.slice(5)} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                  <Bar dataKey="count" name="Workspace" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Credits issued vs used */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Kredit — Diterbitkan vs Dipakai (30 Hari)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={timeSeries.credits} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => v.slice(5)} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="issued" name="Diterbitkan" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="used" name="Dipakai" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top keywords + categories */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">Kata Kunci Scraping Terpopuler</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={intel.topScraperKeywords} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#94a3b8" }} width={90} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]}>
                      <MiniLabel />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Kategori Lead Terbanyak</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={intel.topLeadCategories} layout="vertical" margin={{ left: 8, right: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#94a3b8" }} width={100} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── DATABASE TAB ─────────────────────────────────────────────── */}
      {tab === "database" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4" />Jumlah Record per Tabel</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={dbStats} layout="vertical" margin={{ left: 8, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis dataKey="table" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={100} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} formatter={(v: number) => fmt(v)} />
                    <Bar dataKey="count" name="Records" fill="#10b981" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, fill: "#94a3b8", formatter: (v: number) => v > 0 ? fmt(v) : "" }} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Server className="h-4 w-4" />Database Stats</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dbStats.map(s => (
                      <div key={s.table} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-mono">{s.table}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(100, (s.count / Math.max(1, dbTotal)) * 100 * 12)}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold tabular-nums w-16 text-right">{fmt(s.count)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between text-sm font-semibold">
                      <span>Total rows</span>
                      <span className="tabular-nums text-primary">{fmt(dbTotal)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4" />Kredit Platform</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Total diterbitkan", value: fmt(credits.totalIssued), color: "text-green-500" },
                    { label: "Total dipakai", value: fmt(credits.totalUsed), color: "text-red-500" },
                    { label: "Sisa (estimasi)", value: fmt(credits.totalIssued - credits.totalUsed), color: "text-primary" },
                  ].map(c => (
                    <div key={c.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{c.label}</span>
                      <span className={`font-semibold tabular-nums ${c.color}`}>{c.value}</span>
                    </div>
                  ))}
                  <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, credits.totalIssued > 0 ? (credits.totalUsed / credits.totalIssued) * 100 : 0)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {credits.totalIssued > 0 ? Math.round((credits.totalUsed / credits.totalIssued) * 100) : 0}% kredit terpakai
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVITY TAB ─────────────────────────────────────────────── */}
      {tab === "activity" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Leads */}
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Radar className="h-4 w-4" />Lead Terbaru</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.recentLeads.map((l, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{l.businessName}</div>
                        <div className="text-xs text-muted-foreground">{l.category ?? "-"} · {l.workspace.name}</div>
                      </div>
                      <div className="text-right shrink-0">
                        {l.phone && <div className="text-xs text-green-500 font-mono">+{l.phone}</div>}
                        <div className="text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleDateString("id-ID")}</div>
                      </div>
                    </div>
                  ))}
                  {recentActivity.recentLeads.length === 0 && <p className="text-sm text-muted-foreground">Belum ada lead.</p>}
                </div>
              </CardContent>
            </Card>

            {/* Recent Contacts */}
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" />Kontak Terbaru</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.recentContacts.map((c, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{c.name ?? "(tanpa nama)"}</div>
                        <div className="text-xs text-muted-foreground">{c.workspace.name}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono">+{c.phone}</div>
                        <div className={cn("text-xs font-medium", { ACTIVE: "text-green-500", INACTIVE: "text-red-500", UNKNOWN: "text-muted-foreground" }[c.waStatus] ?? "text-muted-foreground")}>
                          {c.waStatus}
                        </div>
                      </div>
                    </div>
                  ))}
                  {recentActivity.recentContacts.length === 0 && <p className="text-sm text-muted-foreground">Belum ada kontak.</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Blasts */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MessageCircle className="h-4 w-4" />Blast Terbaru</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                      <th className="pb-2">Nama</th>
                      <th className="pb-2">Workspace</th>
                      <th className="pb-2 text-center">Penerima</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.recentBlasts.map((b, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 font-medium">{b.name ?? "(tanpa nama)"}</td>
                        <td className="py-2 text-muted-foreground">{b.workspace.name}</td>
                        <td className="py-2 text-center tabular-nums">{fmt(b.totalRecipients)}</td>
                        <td className="py-2">
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: `${STATUS_COLOR[b.status] ?? "#6b7280"}20`, color: STATUS_COLOR[b.status] ?? "#6b7280" }}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-2 text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString("id-ID")}</td>
                      </tr>
                    ))}
                    {recentActivity.recentBlasts.length === 0 && (
                      <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Belum ada blast.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Top categories comparison */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">Top 10 Kategori Kontak</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {intel.topContactCategories.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-4 text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-0.5">
                          <span className="truncate text-xs">{c.name}</span>
                          <span className="text-xs font-semibold tabular-nums ml-2">{fmt(c.count)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${(c.count / (intel.topContactCategories[0]?.count || 1)) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {intel.topContactCategories.length === 0 && <p className="text-sm text-muted-foreground">Belum ada data.</p>}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Top 10 Kategori Lead</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {intel.topLeadCategories.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-4 text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-0.5">
                          <span className="truncate text-xs">{c.name}</span>
                          <span className="text-xs font-semibold tabular-nums ml-2">{fmt(c.count)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(c.count / (intel.topLeadCategories[0]?.count || 1)) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {intel.topLeadCategories.length === 0 && <p className="text-sm text-muted-foreground">Belum ada data.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

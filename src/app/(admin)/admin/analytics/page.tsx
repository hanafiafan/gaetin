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

function MiniLabel({ x, y, value }: { x?: number; y?: number; value?: number }) {
  if (!value) return null;
  return <text x={x} y={(y ?? 0) - 4} fill="#94a3b8" fontSize={10} textAnchor="middle">{value}</text>;
}

const CHART_CARD = "cg-card rounded-2xl p-5";
const CHART_TITLE = "mb-3 text-sm font-bold text-white";

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
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
    </div>
  );
  if (!data) return <div className="text-slate-400">Gagal memuat data.</div>;

  const { timeSeries, distributions, intel, dbStats, recentActivity, credits, weeklyActivity } = data;

  const totalLeads = timeSeries.leads.reduce((s, d) => s + d.count, 0);
  const totalContacts = timeSeries.contacts.reduce((s, d) => s + d.count, 0);
  const dbTotal = dbStats.reduce((s, d) => s + d.count, 0);

  const mergedTimeSeries = timeSeries.leads.map((l, i) => ({
    date: l.date.slice(5),
    leads: l.count,
    contacts: timeSeries.contacts[i]?.count ?? 0,
    workspaces: timeSeries.workspaces[i]?.count ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analitik Platform</h1>
          <p className="text-sm text-slate-400">Visualisasi data sistem Gaetin secara lengkap.</p>
        </div>
        <button onClick={load} disabled={loading} className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] px-3 text-sm font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary disabled:opacity-50">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Lead 30 hari", value: fmt(totalLeads), icon: Radar, sub: `${fmt(weeklyActivity.newLeadsThisWeek)} minggu ini` },
          { label: "Kontak 30 hari", value: fmt(totalContacts), icon: Users, sub: `${fmt(weeklyActivity.newContactsThisWeek)} minggu ini` },
          { label: "WS Aktif minggu ini", value: fmt(weeklyActivity.activeWsThisWeek), icon: Server, sub: "memiliki lead baru" },
          { label: "Kredit dipakai", value: fmt(credits.totalUsed), icon: CreditCard, sub: `dari ${fmt(credits.totalIssued)} diterbitkan` },
        ].map((c) => (
          <div key={c.label} className="cg-card rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs text-slate-400">{c.label}</div>
              <c.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-white">{c.value}</div>
            <div className="mt-0.5 text-xs text-slate-500">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-white/[0.08]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-bold transition-colors",
              tab === t.key ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className={CHART_CARD}>
              <p className={CHART_TITLE}>Distribusi Paket</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={distributions.plans} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {distributions.plans.map((e) => (<Cell key={e.name} fill={PLAN_COLOR[e.name] ?? COLORS[0]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {distributions.plans.map((p) => (
                  <span key={p.name} className="flex items-center gap-1 text-xs text-slate-400">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: PLAN_COLOR[p.name] ?? COLORS[0] }} />
                    {p.name} ({p.value})
                  </span>
                ))}
              </div>
            </div>

            <div className={CHART_CARD}>
              <p className={CHART_TITLE}>Status WhatsApp Kontak</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={distributions.waStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                    {distributions.waStatus.map((e) => (<Cell key={e.name} fill={WA_COLOR[e.name] ?? COLORS[2]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {distributions.waStatus.map((w) => (
                  <span key={w.name} className="flex items-center gap-1 text-xs text-slate-400">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: WA_COLOR[w.name] ?? COLORS[2] }} />
                    {w.name} ({fmt(w.value)})
                  </span>
                ))}
              </div>
            </div>

            <div className={CHART_CARD}>
              <p className={CHART_TITLE}>Status Langganan</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={distributions.statuses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={70} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {distributions.statuses.map((e) => (<Cell key={e.name} fill={STATUS_COLOR[e.name] ?? COLORS[0]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className={CHART_CARD}>
              <p className={CHART_TITLE}>Status Scraper Jobs</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={distributions.scraperStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {distributions.scraperStatus.map((e) => (<Cell key={e.name} fill={STATUS_COLOR[e.name] ?? COLORS[0]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={CHART_CARD}>
              <p className={CHART_TITLE}>Status Blast</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={distributions.blastStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {distributions.blastStatus.map((e) => (<Cell key={e.name} fill={STATUS_COLOR[e.name] ?? COLORS[0]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "growth" && (
        <div className="space-y-6">
          <div className={CHART_CARD}>
            <p className={CHART_TITLE}>Lead &amp; Kontak Baru — 30 Hari Terakhir</p>
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
          </div>

          <div className={CHART_CARD}>
            <p className={CHART_TITLE}>Workspace Baru — 30 Hari Terakhir</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeSeries.workspaces} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => v.slice(5)} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                <Bar dataKey="count" name="Workspace" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={CHART_CARD}>
            <p className={CHART_TITLE}>Kredit — Diterbitkan vs Dipakai (30 Hari)</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={timeSeries.credits} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => v.slice(5)} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="issued" name="Diterbitkan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="used" name="Dipakai" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className={CHART_CARD}>
              <p className={CHART_TITLE}>Kata Kunci Scraping Terpopuler</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={intel.topScraperKeywords} layout="vertical" margin={{ left: 8, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#94a3b8" }} width={90} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]}><MiniLabel /></Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={CHART_CARD}>
              <p className={CHART_TITLE}>Kategori Lead Terbanyak</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={intel.topLeadCategories} layout="vertical" margin={{ left: 8, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#94a3b8" }} width={100} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "database" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className={CHART_CARD}>
              <p className={cn(CHART_TITLE, "flex items-center gap-2")}><Database className="h-4 w-4" />Jumlah Record per Tabel</p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={dbStats} layout="vertical" margin={{ left: 8, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis dataKey="table" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={100} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }} formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="count" name="Records" fill="#10b981" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, fill: "#94a3b8", formatter: (v: number) => v > 0 ? fmt(v) : "" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <div className={CHART_CARD}>
                <p className={cn(CHART_TITLE, "flex items-center gap-2")}><Server className="h-4 w-4" />Database Stats</p>
                <div className="space-y-2">
                  {dbStats.map((s) => (
                    <div key={s.table} className="flex items-center justify-between">
                      <span className="font-mono text-sm text-slate-400">{s.table}</span>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (s.count / Math.max(1, dbTotal)) * 100 * 12)}%` }} />
                        </div>
                        <span className="w-16 text-right text-sm font-bold tabular-nums text-white">{fmt(s.count)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-white/[0.08] pt-2 text-sm font-bold">
                    <span className="text-slate-400">Total rows</span>
                    <span className="tabular-nums text-primary">{fmt(dbTotal)}</span>
                  </div>
                </div>
              </div>

              <div className={CHART_CARD}>
                <p className={cn(CHART_TITLE, "flex items-center gap-2")}><CreditCard className="h-4 w-4" />Kredit Platform</p>
                <div className="space-y-3">
                  {[
                    { label: "Total diterbitkan", value: fmt(credits.totalIssued), color: "text-emerald-400" },
                    { label: "Total dipakai", value: fmt(credits.totalUsed), color: "text-red-400" },
                    { label: "Sisa (estimasi)", value: fmt(credits.totalIssued - credits.totalUsed), color: "text-primary" },
                  ].map((c) => (
                    <div key={c.label} className="flex justify-between text-sm">
                      <span className="text-slate-400">{c.label}</span>
                      <span className={`font-bold tabular-nums ${c.color}`}>{c.value}</span>
                    </div>
                  ))}
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, credits.totalIssued > 0 ? (credits.totalUsed / credits.totalIssued) * 100 : 0)}%` }} />
                  </div>
                  <p className="text-xs text-slate-500">
                    {credits.totalIssued > 0 ? Math.round((credits.totalUsed / credits.totalIssued) * 100) : 0}% kredit terpakai
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className={CHART_CARD}>
              <p className={cn(CHART_TITLE, "flex items-center gap-2")}><Radar className="h-4 w-4" />Lead Terbaru</p>
              <div className="space-y-3">
                {recentActivity.recentLeads.map((l, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold text-white">{l.businessName}</div>
                      <div className="text-xs text-slate-500">{l.category ?? "-"} · {l.workspace.name}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      {l.phone && <div className="font-mono text-xs text-emerald-400">+{l.phone}</div>}
                      <div className="text-xs text-slate-500">{new Date(l.createdAt).toLocaleDateString("id-ID")}</div>
                    </div>
                  </div>
                ))}
                {recentActivity.recentLeads.length === 0 && <p className="text-sm text-slate-500">Belum ada lead.</p>}
              </div>
            </div>

            <div className={CHART_CARD}>
              <p className={cn(CHART_TITLE, "flex items-center gap-2")}><Users className="h-4 w-4" />Kontak Terbaru</p>
              <div className="space-y-3">
                {recentActivity.recentContacts.map((c, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold text-white">{c.name ?? "(tanpa nama)"}</div>
                      <div className="text-xs text-slate-500">{c.workspace.name}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-mono text-xs text-slate-300">+{c.phone}</div>
                      <div className={cn("text-xs font-bold", { ACTIVE: "text-emerald-400", INACTIVE: "text-red-400", UNKNOWN: "text-slate-500" }[c.waStatus] ?? "text-slate-500")}>
                        {c.waStatus}
                      </div>
                    </div>
                  </div>
                ))}
                {recentActivity.recentContacts.length === 0 && <p className="text-sm text-slate-500">Belum ada kontak.</p>}
              </div>
            </div>
          </div>

          <div className={CHART_CARD}>
            <p className={cn(CHART_TITLE, "flex items-center gap-2")}><MessageCircle className="h-4 w-4" />Blast Terbaru</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] text-left text-xs uppercase text-slate-500">
                    <th className="pb-2">Nama</th>
                    <th className="pb-2">Workspace</th>
                    <th className="pb-2 text-center">Penerima</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.recentBlasts.map((b, i) => (
                    <tr key={i} className="border-b border-white/[0.05] last:border-0">
                      <td className="py-2 font-bold text-white">{b.name ?? "(tanpa nama)"}</td>
                      <td className="py-2 text-slate-400">{b.workspace.name}</td>
                      <td className="py-2 text-center tabular-nums text-white">{fmt(b.totalRecipients)}</td>
                      <td className="py-2">
                        <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: `${STATUS_COLOR[b.status] ?? "#6b7280"}20`, color: STATUS_COLOR[b.status] ?? "#6b7280" }}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-2 text-xs text-slate-500">{new Date(b.createdAt).toLocaleDateString("id-ID")}</td>
                    </tr>
                  ))}
                  {recentActivity.recentBlasts.length === 0 && (
                    <tr><td colSpan={5} className="py-6 text-center text-slate-500">Belum ada blast.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className={CHART_CARD}>
              <p className={CHART_TITLE}>Top 10 Kategori Kontak</p>
              <div className="space-y-2">
                {intel.topContactCategories.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-4 text-xs tabular-nums text-slate-500">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex justify-between">
                        <span className="truncate text-xs text-slate-300">{c.name}</span>
                        <span className="ml-2 text-xs font-bold tabular-nums text-white">{fmt(c.count)}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${(c.count / (intel.topContactCategories[0]?.count || 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
                {intel.topContactCategories.length === 0 && <p className="text-sm text-slate-500">Belum ada data.</p>}
              </div>
            </div>
            <div className={CHART_CARD}>
              <p className={CHART_TITLE}>Top 10 Kategori Lead</p>
              <div className="space-y-2">
                {intel.topLeadCategories.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-4 text-xs tabular-nums text-slate-500">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex justify-between">
                        <span className="truncate text-xs text-slate-300">{c.name}</span>
                        <span className="ml-2 text-xs font-bold tabular-nums text-white">{fmt(c.count)}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(c.count / (intel.topLeadCategories[0]?.count || 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
                {intel.topLeadCategories.length === 0 && <p className="text-sm text-slate-500">Belum ada data.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

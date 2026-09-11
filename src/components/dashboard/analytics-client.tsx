"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { BarChart3, Loader2, TrendingUp, Users, Target, DollarSign } from "lucide-react";
// Di-alias ke palet gelap: area kerja bertema gelap, sedangkan konsol admin
// masih terang dan tetap memakai CHART biasa. Alias di satu tempat lebih aman
// daripada menukar ~20 pemakaian satu per satu.
import {
  CHART_SHEET as CHART,
  CHART_SHEET_TOOLTIP as CHART_TOOLTIP,
  CHART_SHEET_CURSOR_FILL as CHART_CURSOR_FILL,
  CHART_SHEET_CURSOR_LINE as CHART_CURSOR_LINE,
  CHART_MAX_BAR,
} from "@/lib/chart-theme";
import { isAllZero, EmptyChart } from "@/components/empty-chart";
import MetricStrip from "@/components/dashboard/metric-strip";

interface Summary {
  funnel: { stage: string; value: number }[];
  sources: { source: string; count: number }[];
  revenue: number;
  wonCount: number;
  byCampaign: { name: string; revenue: number }[];
}
interface Trends {
  days: { date: string; contacts: number; messages: number }[];
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const CHART_TOOLTIP_STYLE = CHART_TOOLTIP;

/* Nilai enum LeadSource tampil mentah sebagai "SCRAPER"/"IMPORT" di sumbu
   grafik. Kebocoran yang sama dengan status kampanye dan peran anggota tim. */
const SOURCE_LABEL: Record<string, string> = {
  SCRAPER: "Google Maps",
  IMPORT: "Unggahan Excel",
  MANUAL: "Diketik sendiri",
  INBOUND: "Menghubungi duluan",
};

export default function AnalyticsClient() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [trends, setTrends] = useState<Trends | null>(null);

  useEffect(() => {
    (async () => {
      const [rs, rt] = await Promise.all([fetch("/api/analytics/summary"), fetch("/api/analytics/trends")]);
      const [js, jt] = await Promise.all([rs.json(), rt.json()]);
      if (js.success) setSummary(js.data);
      if (jt.success) setTrends(jt.data);
    })();
  }, []);

  if (!summary || !trends) {
    return (
      <div className="flex min-h-[200px] items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Memuat analitik...</span>
      </div>
    );
  }

  const contacts = summary.funnel.find((f) => f.stage === "Disimpan jadi kontak")?.value ?? 0;
  const leads = summary.funnel.find((f) => f.stage === "Hasil pencarian")?.value ?? 0;

  const kpiCards = [
    { label: "Uang masuk", value: formatIDR(summary.revenue), icon: DollarSign, accent: true },
    { label: "Penjualan jadi", value: summary.wonCount.toLocaleString("id-ID"), icon: TrendingUp },
    { label: "Kontak tersimpan", value: contacts.toLocaleString("id-ID"), icon: Users },
    { label: "Belum disimpan", value: leads.toLocaleString("id-ID"), icon: Target },
  ];

  return (
    <div className="space-y-5">
      <MetricStrip items={kpiCards} />

      {/* Charts row */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="cg-card rounded-xl p-5">
          <h2 className="mb-4 text-sm font-bold text-foreground">Dari kontak sampai pembeli</h2>
          {isAllZero(summary.funnel, ["value"]) ? (
            <EmptyChart height={240} label="Belum ada datanya." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={summary.funnel} layout="vertical" margin={{ left: 10, right: 16 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" width={90} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: CHART_CURSOR_FILL }} />
                <Bar dataKey="value" fill={CHART.accent} radius={0} maxBarSize={CHART_MAX_BAR} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="cg-card rounded-xl p-5">
          <h2 className="mb-4 text-sm font-bold text-foreground">Kontak datang dari mana</h2>
          {isAllZero(summary.sources, ["count"]) ? (
            <EmptyChart height={240} label="Belum ada datanya." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={summary.sources}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="source" tickFormatter={(v: string) => SOURCE_LABEL[v] ?? v} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: CHART_CURSOR_FILL }} />
                <Bar dataKey="count" fill={CHART.ink} radius={0} maxBarSize={CHART_MAX_BAR} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Trends */}
      <div className="cg-card rounded-xl p-5">
        <h2 className="mb-4 text-sm font-bold text-foreground">Perkembangan 30 hari terakhir</h2>
        {isAllZero(trends.days, ["contacts", "messages"]) ? (
          <EmptyChart height={260} label="Belum ada aktivitas dalam 30 hari terakhir." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trends.days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} interval={4} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR_LINE} />
              <Legend wrapperStyle={{ fontSize: "12px", color: CHART.axis }} />
              <Line type="monotone" dataKey="contacts" name="Kontak baru" stroke={CHART.accent} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: CHART.accent }} />
              <Line type="monotone" dataKey="messages" name="Pesan terkirim" stroke={CHART.ink} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: CHART.ink }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ROI per campaign */}
      <div className="cg-card rounded-xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-foreground" />
          <h2 className="text-sm font-bold text-foreground">Hasil tiap pengiriman</h2>
        </div>
        {summary.byCampaign.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Belum ada revenue dari kampanye.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-left text-xs font-bold uppercase text-muted-foreground">Kampanye</th>
                  <th className="p-4 text-right text-xs font-bold uppercase text-muted-foreground">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {summary.byCampaign.map((c, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-card">
                    <td className="p-4 font-medium text-foreground">{c.name}</td>
                    <td className="p-4 text-right font-semibold text-success">{formatIDR(c.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

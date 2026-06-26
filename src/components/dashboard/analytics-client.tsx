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
import { Card, CardContent } from "@/components/ui/card";

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
    return <p className="text-sm text-muted-foreground">Memuat data...</p>;
  }

  const contacts = summary.funnel.find((f) => f.stage === "Kontak")?.value ?? 0;
  const leads = summary.funnel.find((f) => f.stage === "Lead mentah")?.value ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Revenue (closing)", value: formatIDR(summary.revenue) },
          { label: "Deal menang", value: summary.wonCount.toLocaleString("id-ID") },
          { label: "Total kontak", value: contacts.toLocaleString("id-ID") },
          { label: "Lead mentah", value: leads.toLocaleString("id-ID") },
        ].map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">{c.label}</div>
              <div className="mt-1 text-2xl font-semibold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 text-sm font-medium">Funnel konversi</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={summary.funnel} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="stage" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 text-sm font-medium">Sumber lead</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={summary.sources}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="source" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#1e6f5c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 text-sm font-medium">Tren 30 hari</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trends.days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="contacts" name="Kontak baru" stroke="#2563eb" dot={false} />
              <Line type="monotone" dataKey="messages" name="Pesan terkirim" stroke="#1e6f5c" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 text-sm font-medium">ROI per kampanye</h2>
          {summary.byCampaign.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada revenue dari kampanye.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2">Kampanye</th>
                  <th className="py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {summary.byCampaign.map((c, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2">{c.name}</td>
                    <td className="py-2 text-right font-medium">{formatIDR(c.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import AnalyticsClient from "@/components/dashboard/analytics-client";
import { BarChart3, LineChart, PieChart, Sparkles } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Business Intelligence</span>
            <h1 className="text-3xl font-bold tracking-tight text-white">Analitik</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Funnel konversi, sumber lead, tren pengiriman, dan ROI per kampanye.</p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><BarChart3 className="h-4 w-4 text-primary" /> KPI revenue dan funnel</div>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><LineChart className="h-4 w-4 text-primary" /> Tren 30 hari</div>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><PieChart className="h-4 w-4 text-primary" /> Sumber lead dan ROI</div>
          </div>
        </div>
      </div>
      <AnalyticsClient />
    </div>
  );
}

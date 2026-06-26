import AnalyticsClient from "@/components/dashboard/analytics-client";
import { Badge } from "@/components/ui/badge";
import { BarChart3, LineChart, PieChart, Sparkles } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10"><Sparkles className="h-3.5 w-3.5" /> Business Intelligence</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Analitik</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Funnel konversi, sumber lead, tren pengiriman, dan ROI per kampanye.</p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><BarChart3 className="h-4 w-4 text-primary" /> KPI revenue dan funnel</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><LineChart className="h-4 w-4 text-primary" /> Tren 30 hari</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><PieChart className="h-4 w-4 text-primary" /> Sumber lead dan ROI</div>
          </div>
        </div>
      </div>
      <AnalyticsClient />
    </div>
  );
}

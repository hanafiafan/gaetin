import AnalyticsClient from "@/components/dashboard/analytics-client";
import PageHero from "@/components/dashboard/page-hero";
import { BarChart3, LineChart, PieChart, Sparkles } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <PageHero
        tone="kelola"
        kicker="Business Intelligence"
        kickerIcon={Sparkles}
        title="Analitik"
        description="Funnel konversi, sumber lead, tren pengiriman, dan ROI per kampanye."
        features={[
          { icon: BarChart3, label: "KPI revenue dan funnel" },
          { icon: LineChart, label: "Tren 30 hari" },
          { icon: PieChart, label: "Sumber lead dan ROI" },
        ]}
      />
      <AnalyticsClient />
    </div>
  );
}

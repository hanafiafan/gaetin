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
      />
      <AnalyticsClient />
    </div>
  );
}

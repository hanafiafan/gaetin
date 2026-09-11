import AnalyticsClient from "@/components/dashboard/analytics-client";
import PageHero from "@/components/dashboard/page-hero";
import { BarChart3, LineChart, PieChart, Sparkles } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-5">
      <PageHero
        title="Laporan"
        description="Lihat berapa kontak yang masuk, berapa yang membalas, dan berapa yang akhirnya membeli."
      />
      <AnalyticsClient />
    </div>
  );
}

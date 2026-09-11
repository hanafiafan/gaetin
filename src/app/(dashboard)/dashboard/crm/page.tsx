import CrmBoard from "@/components/dashboard/crm-board";
import PageHero from "@/components/dashboard/page-hero";
import { BadgeDollarSign, KanbanSquare, Sparkles, Workflow } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function CrmPage() {
  await requirePlanFeature("crmPipeline");
  return (
    <div className="space-y-5">
      <PageHero
        tone="kelola"
        kicker="Kelola"
        title="Peluang Penjualan"
        description="Pantau calon pembeli dari baru kenal sampai jadi beli. Geser kartunya saat statusnya berubah."
      />
      <CrmBoard />
    </div>
  );
}

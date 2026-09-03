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
        kicker="Sales Pipeline"
        kickerIcon={Sparkles}
        title="CRM Pipeline"
        description="Kelola peluang dari lead baru sampai closing. Geser kartu antar stage dan catat nilai deal untuk ROI."
        features={[
          { icon: KanbanSquare, label: "Kanban pipeline untuk follow-up harian" },
          { icon: BadgeDollarSign, label: "Closed Won otomatis masuk revenue" },
          { icon: Workflow, label: "Hubungkan aktivitas sales dan campaign" },
        ]}
      />
      <CrmBoard />
    </div>
  );
}

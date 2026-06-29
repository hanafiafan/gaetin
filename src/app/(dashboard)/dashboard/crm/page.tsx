import CrmBoard from "@/components/dashboard/crm-board";
import { BadgeDollarSign, KanbanSquare, Sparkles, Workflow } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function CrmPage() {
  await requirePlanFeature("crmPipeline");
  return (
    <div className="space-y-5">
      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Sales Pipeline</span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">CRM Pipeline</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Kelola peluang dari lead baru sampai closing. Geser kartu antar stage dan catat nilai deal untuk ROI.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><KanbanSquare className="h-4 w-4 text-primary" /> Kanban pipeline untuk follow-up harian</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><BadgeDollarSign className="h-4 w-4 text-primary" /> Closed Won otomatis masuk revenue</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><Workflow className="h-4 w-4 text-primary" /> Hubungkan aktivitas sales dan campaign</div>
          </div>
        </div>
      </div>
      <CrmBoard />
    </div>
  );
}

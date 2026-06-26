import CrmBoard from "@/components/dashboard/crm-board";
import { Badge } from "@/components/ui/badge";
import { BadgeDollarSign, KanbanSquare, Sparkles, Workflow } from "lucide-react";

export default function CrmPage() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10">
              <Sparkles className="h-3.5 w-3.5" />
              Sales Pipeline
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">CRM Pipeline</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Kelola peluang dari lead baru sampai closing. Geser kartu antar stage dan catat nilai deal untuk ROI.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
              <KanbanSquare className="h-4 w-4 text-primary" />
              Kanban pipeline untuk follow-up harian
            </div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
              <BadgeDollarSign className="h-4 w-4 text-primary" />
              Closed Won otomatis masuk revenue
            </div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
              <Workflow className="h-4 w-4 text-primary" />
              Hubungkan aktivitas sales dan campaign
            </div>
          </div>
        </div>
      </div>
      <CrmBoard />
    </div>
  );
}

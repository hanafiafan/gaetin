import TasksClient from "@/components/dashboard/tasks-client";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, CheckSquare, Sparkles, UserRoundCheck } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10">
              <Sparkles className="h-3.5 w-3.5" />
              Sales Taskboard
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Tugas</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Catat pengingat follow-up manual, prioritaskan kontak penting, dan tandai pekerjaan sales yang selesai.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><CheckSquare className="h-4 w-4 text-primary" /> Tugas per kontak</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><CalendarCheck className="h-4 w-4 text-primary" /> Due date dan overdue</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><UserRoundCheck className="h-4 w-4 text-primary" /> Follow-up manual</div>
          </div>
        </div>
      </div>
      <TasksClient />
    </div>
  );
}

import TasksClient from "@/components/dashboard/tasks-client";
import { CalendarCheck, CheckSquare, Sparkles, UserRoundCheck } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="space-y-5">
      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Sales Taskboard</span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Tugas</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Catat pengingat follow-up manual, prioritaskan kontak penting, dan tandai pekerjaan sales yang selesai.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><CheckSquare className="h-4 w-4 text-primary" /> Tugas per kontak</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><CalendarCheck className="h-4 w-4 text-primary" /> Due date dan overdue</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><UserRoundCheck className="h-4 w-4 text-primary" /> Follow-up manual</div>
          </div>
        </div>
      </div>
      <TasksClient />
    </div>
  );
}

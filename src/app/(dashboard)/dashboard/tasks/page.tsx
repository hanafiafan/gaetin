import TasksClient from "@/components/dashboard/tasks-client";
import PageHero from "@/components/dashboard/page-hero";
import { CalendarCheck, CheckSquare, Sparkles, UserRoundCheck } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="space-y-5">
      <PageHero
        tone="kelola"
        kicker="Sales Taskboard"
        kickerIcon={Sparkles}
        title="Tugas"
        description="Catat pengingat follow-up manual, prioritaskan kontak penting, dan tandai pekerjaan sales yang selesai."
        features={[
          { icon: CheckSquare, label: "Tugas per kontak" },
          { icon: CalendarCheck, label: "Due date dan overdue" },
          { icon: UserRoundCheck, label: "Follow-up manual" },
        ]}
      />
      <TasksClient />
    </div>
  );
}

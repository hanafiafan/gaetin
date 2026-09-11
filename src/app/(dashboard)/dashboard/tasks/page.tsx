import TasksClient from "@/components/dashboard/tasks-client";
import PageHero from "@/components/dashboard/page-hero";
import { CalendarCheck, CheckSquare, Sparkles, UserRoundCheck } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="space-y-5">
      <PageHero
        title="Daftar Tugas"
        description="Catat pekerjaan yang harus kamu kerjakan beserta tenggatnya, supaya tidak ada calon pembeli yang terlupa."
      />
      <TasksClient />
    </div>
  );
}

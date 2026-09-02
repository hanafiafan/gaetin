import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  /** e.g. "text-primary" */
  color?: string;
  /** e.g. "bg-primary/10" */
  bg?: string;
}

/** Small metric card — extracted from the dashboard home / analytics / billing KPI grids. */
export default function StatCard({ label, value, detail, icon: Icon, color = "text-primary", bg = "bg-primary/10" }: StatCardProps) {
  return (
    <Card className="cg-card rounded-2xl border-0 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bg} ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {detail && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/50" />
          {detail}
        </div>
      )}
    </Card>
  );
}

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TONE_SOFT, TONE_WASH, type SectionTone } from "@/components/dashboard/section-tone";

export interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  /** Tints the tile and icon chip with a section color instead of plain white/grey. */
  tone?: SectionTone;
  /** Fills the tile with the accent — use for the single most important metric. */
  accent?: boolean;
}

/** Metric tile — oversized display numeral over a tiny wide-tracked label. */
export default function StatCard({ label, value, detail, icon: Icon, tone, accent = false }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl border border-border p-6 transition-colors duration-200",
        accent ? "bg-primary text-primary-foreground" : tone ? TONE_WASH[tone] : "bg-background",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn("cg-label", accent ? "opacity-70" : "text-muted-foreground")}>{label}</div>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
            accent ? "border-primary-foreground/30" : tone ? cn("border-transparent", TONE_SOFT[tone]) : "border-border bg-muted",
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>
      <div className="cg-display mt-8 text-4xl">{value}</div>
      {detail && (
        <div className={cn("mt-3 text-xs leading-5", accent ? "opacity-70" : "text-muted-foreground")}>
          {detail}
        </div>
      )}
    </div>
  );
}

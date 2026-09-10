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
  /** Marks the single most important metric. Reads as a yellow edge + solid
   * yellow icon chip rather than a fully-yellow tile, so it still leads the
   * row without out-shouting the page's one real CTA. */
  accent?: boolean;
}

/** Metric tile — oversized display numeral over a tiny wide-tracked label. */
export default function StatCard({ label, value, detail, icon: Icon, tone, accent = false }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl border border-border p-6 transition-colors duration-200",
        accent ? "border-t-[6px] border-t-primary bg-primary/[0.10]" : tone ? TONE_WASH[tone] : "bg-background",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="cg-label text-muted-foreground">{label}</div>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
            accent ? "border-transparent bg-primary text-primary-foreground" : tone ? cn("border-transparent", TONE_SOFT[tone]) : "border-border bg-muted",
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>
      <div className="cg-display mt-8 text-4xl">{value}</div>
      {detail && (
        <div className="mt-3 text-xs leading-5 text-muted-foreground">{detail}</div>
      )}
    </div>
  );
}

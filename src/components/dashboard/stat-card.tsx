import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TONE_SOFT, type SectionTone } from "@/components/dashboard/section-tone";

export interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  /** Mewarnai chip ikonnya saja. Dulu ronanya membanjiri seluruh ubin —
   * empat ubin berdampingan jadi empat warna berbeda dan tidak ada yang
   * menonjol. Referensinya: permukaan netral, warna hanya pada penanda. */
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
        accent ? "border-t-[3px] border-t-primary bg-card" : "bg-card",
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

import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  /** Retained for call-site compatibility; the flat theme derives its own skin. */
  color?: string;
  bg?: string;
  /** Fills the tile with the accent — use for the single most important metric. */
  accent?: boolean;
}

/** Metric tile — oversized display numeral over a tiny wide-tracked label. */
export default function StatCard({ label, value, detail, icon: Icon, accent = false }: StatCardProps) {
  return (
    <div
      className={`flex flex-col justify-between border border-border p-6 ${
        accent ? "bg-primary text-primary-foreground" : "bg-background"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`cg-label ${accent ? "opacity-70" : "text-muted-foreground"}`}>{label}</div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center border ${
            accent ? "border-primary-foreground/30" : "border-border bg-muted"
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>
      <div className="cg-display mt-8 text-4xl">{value}</div>
      {detail && (
        <div className={`mt-3 text-xs leading-5 ${accent ? "opacity-70" : "text-muted-foreground"}`}>
          {detail}
        </div>
      )}
    </div>
  );
}

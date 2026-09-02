export interface Stat {
  value: string;
  label: string;
}

interface StatRowProps {
  stats: Stat[];
  /** Dark panels invert the hairline dividers and label color. */
  inverted?: boolean;
  className?: string;
}

/**
 * Hairline-divided stat row: oversized display numeral above a tiny
 * wide-tracked label, split by vertical rules.
 */
const COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
};

export default function StatRow({ stats, inverted = false, className = "" }: StatRowProps) {
  const divider = inverted ? "border-background/20" : "border-border";
  const labelColor = inverted ? "text-background/60" : "text-muted-foreground";

  return (
    <div className={`grid grid-cols-2 ${COLS[stats.length] ?? "sm:grid-cols-4"} ${className}`}>
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`px-4 py-5 first:pl-0 ${i > 0 ? `border-l ${divider}` : ""}`}
        >
          <div className="cg-display text-4xl sm:text-5xl">{stat.value}</div>
          <div className={`cg-label mt-2 ${labelColor}`}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

import { BarChart2 } from "lucide-react";

/** Recharts renders a blank canvas for an all-zero dataset — this makes that
 * state look like a designed empty panel instead of a broken chart. Shared
 * between the tenant dashboard and admin analytics, which both hit this. */
export function isAllZero(data: { [k: string]: unknown }[], keys: string[]) {
  return data.length === 0 || data.every((row) => keys.every((k) => !row[k]));
}

export function EmptyChart({ height, label }: { height: number; label: string }) {
  return (
    <div
      style={{ height }}
      className="flex flex-col items-center justify-center gap-2 border border-dashed border-border text-center"
    >
      <BarChart2 className="h-5 w-5 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

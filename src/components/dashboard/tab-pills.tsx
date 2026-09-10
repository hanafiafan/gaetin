"use client";

import { cn } from "@/lib/utils";

/**
 * Pil filter dengan jumlah, seperti tab "All invoices / Draft 3 / Unpaid 5"
 * di referensi. Jumlahnya bukan hiasan: ia menjawab "ada apa saja di menu ini"
 * tanpa user harus mengklik tiap tab satu per satu.
 */

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

export default function TabPills({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {items.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            aria-pressed={active}
            className={cn(
              "flex h-9 items-center gap-2 rounded-full border px-4 text-sm transition",
              active
                ? "border-primary bg-primary font-semibold text-primary-foreground"
                : "border-border text-foreground/70 hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px] font-bold",
                  active ? "bg-primary-foreground/15" : "bg-foreground/10",
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

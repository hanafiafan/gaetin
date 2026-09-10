import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Beberapa metrik sejajar di dalam SATU kartu lebar, dengan panel opsional di
 * kanan — pola utama dari referensi.
 *
 * Sebelumnya tiap halaman menaruh 3-4 kartu terpisah berukuran sama. Itu
 * memberi bobot visual yang sama ke semuanya dan memakan empat kali border,
 * padahal angka-angka itu satu kelompok bacaan. Menyatukannya membuat mata
 * membacanya sebagai satu baris ringkasan, dan menyisakan ruang untuk satu
 * hal yang benar-benar menonjol di panel kanan.
 */

export interface Metric {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  /** Sorot satu metrik terpenting dengan warna aksen. */
  accent?: boolean;
}

export default function MetricStrip({
  items,
  aside,
  className,
}: {
  items: Metric[];
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("cg-card grid gap-px overflow-hidden rounded-3xl bg-border", aside && "lg:grid-cols-[1fr_auto]", className)}>
      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        {items.map((m) => {
          const Icon = m.icon;
          return (
            // gap tetap, bukan justify-between: sel di grid ini diregangkan
            // mengikuti tinggi panel aside, dan justify-between mendorong
            // angkanya jauh ke bawah sampai terputus dari labelnya.
            <div key={m.label} className="flex flex-col gap-5 bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                {Icon && (
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      m.accent ? "bg-primary text-primary-foreground" : "bg-foreground/[0.07] text-foreground/70",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                )}
              </div>
              <div>
                <p className={cn("text-3xl font-semibold tracking-tight", m.accent ? "text-primary" : "text-foreground")}>
                  {m.value}
                </p>
                {m.hint && <p className="mt-1 text-xs text-muted-foreground">{m.hint}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {aside && <div className="bg-card p-5 lg:w-[320px]">{aside}</div>}
    </div>
  );
}

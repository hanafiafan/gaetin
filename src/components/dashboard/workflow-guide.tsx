import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Alur kerja lima langkah, dari nol sampai penjualan tercatat.
 *
 * Sebelumnya halaman Ringkasan hanya punya daftar centang empat langkah
 * pemasangan. Itu menjawab "apa yang belum saya siapkan", bukan "apa yang
 * sebenarnya saya lakukan dengan aplikasi ini" — pertanyaan yang justru
 * dipegang orang yang baru pertama membuka.
 *
 * Aturan pentingnya: TEPAT SATU langkah ditandai sebagai giliran sekarang.
 * Daftar yang menyorot banyak hal sekaligus sama membingungkannya dengan
 * daftar yang tidak menyorot apa pun.
 */

export interface WorkflowStep {
  title: string;
  /** Apa yang terjadi di langkah ini, bahasa sehari-hari. */
  desc: string;
  href: string;
  cta: string;
  done: boolean;
}

export default function WorkflowGuide({ steps }: { steps: WorkflowStep[] }) {
  const doneCount = steps.filter((s) => s.done).length;
  // Langkah berjalan = langkah belum selesai yang paling awal. Kalau semua
  // sudah selesai, tidak ada yang disorot.
  const currentIndex = steps.findIndex((s) => !s.done);

  return (
    <section className="cg-card overflow-hidden rounded-xl">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Cara kerja Hellens</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Lima langkah, dari mencari calon pembeli sampai mencatat penjualan.
          </p>
        </div>
        <span className="rounded-md bg-foreground/[0.07] px-3 py-1.5 text-sm font-semibold text-foreground">
          {doneCount} dari {steps.length} selesai
        </span>
      </header>

      <ol className="divide-y divide-border">
        {steps.map((step, i) => {
          const isCurrent = i === currentIndex;
          return (
            <li
              key={step.title}
              className={cn(
                "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center",
                isCurrent && "bg-primary/[0.07]",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold",
                  step.done
                    ? "bg-success text-success-foreground"
                    : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground/[0.07] text-muted-foreground",
                )}
              >
                {step.done ? <Check className="h-5 w-5" strokeWidth={3} /> : i + 1}
              </span>

              <div className="min-w-0 flex-1 sm:ml-4">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                  {step.title}
                  {step.done && (
                    <span className="rounded bg-success/15 px-2 py-0.5 text-xs font-bold uppercase text-success">
                      Selesai
                    </span>
                  )}
                  {isCurrent && (
                    <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold uppercase text-primary-foreground">
                      Giliran ini
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>

              <Link
                href={step.href}
                className={cn(
                  "flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-5 font-semibold transition",
                  isCurrent
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border text-foreground/80 hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {step.done ? "Buka lagi" : step.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

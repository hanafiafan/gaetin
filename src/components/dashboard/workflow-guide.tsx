"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkflowStep {
  title: string;
  desc: string;
  href: string;
  cta: string;
  done: boolean;
}

export default function WorkflowGuide({ steps }: { steps: WorkflowStep[] }) {
  const next = steps.findIndex((step) => !step.done);
  const [selected, setSelected] = useState(next < 0 ? 0 : next);
  const active = steps[selected];
  if (!active) return null;
  return (
    <section className="cg-card cg-sheet p-3 sm:p-5" aria-labelledby="workflow-title">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3 px-2 pt-1">
        <div>
          <h2 id="workflow-title" className="text-lg font-semibold">Alur kerja Anda</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pilih langkah untuk melihat tindakan yang bisa dilakukan.</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium">{steps.filter(s => s.done).length}/{steps.length} tahap sudah digunakan</span>
      </header>
      <div className="grid gap-4 lg:grid-cols-[minmax(260px,0.85fr)_1.4fr]">
        <div className="space-y-1" aria-label="Langkah kerja">
          {steps.map((step, i) => (
            <button key={step.href} type="button" aria-pressed={selected === i} aria-controls="workflow-detail" onClick={() => setSelected(i)}
              className={cn("flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition", selected === i ? "bg-[#262d37] text-white" : "hover:bg-muted")}>
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs", selected === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                {step.done ? <Check className="h-4 w-4" /> : `0${i + 1}`}
              </span>
              <span className="flex-1 text-sm font-medium">{step.title}</span>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
            </button>
          ))}
        </div>
        <div id="workflow-detail" className="cg-onyx flex flex-col justify-between rounded-[22px] p-6 sm:p-8" aria-live="polite">
          <div>
            <span className="text-xs text-muted-foreground">LANGKAH {String(selected + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</span>
            <h3 className="mt-6 max-w-md text-2xl font-medium tracking-tight sm:text-3xl">{active.title}</h3>
            <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">{active.desc}</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
            <span className="text-xs text-muted-foreground">{active.done ? "Sudah digunakan · dapat dibuka kembali" : selected === next ? "Disarankan untuk langkah berikutnya" : "Buka saat Anda membutuhkannya"}</span>
            <Link href={active.href} className="inline-flex min-h-11 items-center gap-3 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">
              {active.cta}<ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

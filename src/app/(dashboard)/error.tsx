"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="cg-card cg-sheet mx-auto max-w-xl p-8 sm:p-12" role="alert" aria-labelledby="workspace-error-title">
      <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning"><AlertCircle className="h-6 w-6" /></span>
      <h1 id="workspace-error-title" className="text-2xl font-semibold tracking-tight">Halaman belum berhasil dimuat</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">Coba muat ulang halaman ini. Jika masalah berlanjut, kembali ke ringkasan atau hubungi bantuan.</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"><RotateCcw className="h-4 w-4" />Coba lagi</button>
        <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-medium"><ArrowLeft className="h-4 w-4" />Ringkasan</Link>
      </div>
      <Link href="/dashboard/support" className="mt-6 inline-block text-sm text-muted-foreground underline underline-offset-4">Hubungi bantuan</Link>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowUpRight, RotateCcw } from "lucide-react";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col justify-between">
      <div className="cg-section flex flex-1 flex-col justify-center py-20">
        <span className="cg-kicker">Terjadi kesalahan</span>
        <h1 className="cg-display mt-7 text-[clamp(3rem,13vw,10rem)]">
          Ada yang
          <br />
          <span className="cg-highlight">bermasalah.</span>
        </h1>
        <p className="mt-8 max-w-md text-sm leading-7 text-muted-foreground">
          Sistem gagal memuat halaman ini. Coba muat ulang — kalau masih gagal, hubungi tim
          support dari dalam dashboard.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={reset}
            className="cg-label flex items-center gap-2 bg-foreground px-6 py-4 text-background transition hover:bg-primary hover:text-primary-foreground"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2.5} />
            Coba lagi
          </button>
          <Link
            href="/dashboard"
            className="cg-label flex items-center gap-2 border border-foreground px-6 py-4 transition hover:bg-foreground hover:text-background"
          >
            Ke dashboard
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      <div className="cg-section flex items-center justify-between border-t border-border py-6">
        <span className="cg-label text-muted-foreground">Hellens</span>
        <span className="cg-cross" />
      </div>
    </main>
  );
}

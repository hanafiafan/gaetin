import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col justify-between">
      <div className="cg-section flex flex-1 flex-col justify-center py-20">
        <span className="cg-kicker">Error 404</span>
        <h1 className="cg-display mt-7 text-[clamp(3.5rem,16vw,12rem)]">
          Halaman
          <br />
          <span className="cg-highlight">tidak ada.</span>
        </h1>
        <p className="mt-8 max-w-md text-sm leading-7 text-muted-foreground">
          Alamat yang kamu buka sudah dipindah atau tidak pernah ada. Kembali ke beranda atau
          langsung ke dashboard.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/"
            className="cg-label flex items-center gap-2 bg-foreground px-6 py-4 text-background transition hover:bg-primary hover:text-primary-foreground"
          >
            Ke beranda
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
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

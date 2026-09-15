"use client";
import Link from "next/link";
import { PublicShell } from "@/components/public/public-shell";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <PublicShell>
      <main id="main-content" className="pub-wrap pub-error">
        <div>
          <span className="pub-eyebrow">SEBENTAR, KITA COBA LAGI.</span>
          <h1>
            ADA SEDIKIT
            <br />
            <span className="pub-orange-text">HAMBATAN.</span>
          </h1>
          <p>
            Halaman belum berhasil dimuat. Coba kembali atau buka panduan jika
            kendala berlanjut.
          </p>
          <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
            <button className="pub-button pub-button-dark" onClick={reset}>
              Coba lagi ↻
            </button>
            <Link href="/panduan" className="pub-button pub-button-outline">
              Buka panduan ↗
            </Link>
          </div>
        </div>
      </main>
    </PublicShell>
  );
}

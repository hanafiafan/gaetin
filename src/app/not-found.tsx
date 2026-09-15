import Link from "next/link";
import { PublicShell } from "@/components/public/public-shell";
export default function NotFound() {
  return (
    <PublicShell>
      <main id="main-content" className="pub-wrap pub-error">
        <div>
          <span className="pub-eyebrow">404 / SEDIKIT SALAH ARAH</span>
          <h1>
            JALAN INI
            <br />
            <span className="pub-orange-text">BELUM ADA.</span>
          </h1>
          <p>
            Halaman yang Anda cari tidak ditemukan. Masih banyak peluang lain
            yang bisa dijelajahi dari beranda.
          </p>
          <Link href="/" className="pub-button pub-button-dark">
            Kembali ke beranda ↗
          </Link>
        </div>
      </main>
    </PublicShell>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Brand, PublicMotion } from "@/components/public/public-shell";
export const metadata: Metadata = {
  title: "Akun Hellens — Mulai hubungan baru",
  robots: { index: false, follow: false },
};
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicMotion>
      <div className="pub-auth">
        <aside className="pub-auth-story">
          <Brand />
          <h2>
            PELUANG BARU.
            <br />
            CERITA BARU.
            <br />
            <span className="pub-orange-text">MULAI DARI ANDA.</span>
          </h2>
          <p>
            Satu ruang untuk menemukan prospek, membangun percakapan dan membawa
            bisnis melangkah lebih jauh.
          </p>
          <div className="pub-auth-art">
            <Image
              src="/illustrations/business-crowd.webp"
              alt="Beragam pelaku usaha yang tumbuh bersama."
              fill
              sizes="50vw"
              priority
            />
          </div>
          <small>HELLENS · CARI PROSPEK. BANGUN HUBUNGAN.</small>
        </aside>
        <main className="pub-auth-form" id="main-content">
          <div className="pub-auth-form-inner">
            <Link href="/" className="pub-auth-back">
              ← Kembali ke beranda
            </Link>
            {children}
            <p style={{ marginTop: 32, fontSize: 10, color: "#777" }}>
              Butuh petunjuk?{" "}
              <Link href="/panduan" style={{ textDecoration: "underline" }}>
                Buka panduan Hellens
              </Link>
            </p>
          </div>
        </main>
      </div>
    </PublicMotion>
  );
}

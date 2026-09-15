"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X, MoveUpRight } from "lucide-react";
import {
  motion,
  MotionConfig,
  useScroll,
  useReducedMotion,
} from "motion/react";
import "./public.css";

function Arrival() {
  const pathname = usePathname();
  return (
    <div key={pathname} className="pub-arrival" aria-hidden="true">
      <Image
        src="/brand/hellens-mark-white.png"
        alt=""
        width={72}
        height={72}
      />
      <span>HELLENS</span>
      <i />
    </div>
  );
}

export function PublicMotion({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="public-site">
        <Arrival />
        {children}
      </div>
    </MotionConfig>
  );
}

export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced ? {} : { y: [24, 0], opacity: [0.55, 1] }}
      viewport={{ once: false, amount: 0.12 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Brand() {
  return (
    <Link className="pub-brand" href="/" aria-label="Hellens — Beranda">
      <Image
        className="pub-logo-image"
        src="/brand/hellens-mark-white.png"
        width={40}
        height={40}
        alt=""
      />
      HELLENS
    </Link>
  );
}

const links = [
  { href: "/#fitur", label: "Produk" },
  { href: "/#cara-kerja", label: "Cara kerja" },
  { href: "/#harga", label: "Harga" },
  { href: "/blog", label: "Jurnal" },
  { href: "/panduan", label: "Panduan" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        document.getElementById("public-menu-toggle")?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="pub-header">
      <a className="pub-skip" href="#main-content">
        Lewati navigasi
      </a>
      <div className="pub-nav pub-wrap">
        <Brand />
        <nav className="pub-desktop-nav" aria-label="Navigasi utama">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/login" className="pub-login">
          Masuk <ArrowUpRight size={15} />
        </Link>
        <Link
          href="/register"
          className="pub-button pub-button-small pub-nav-cta"
        >
          Mulai gratis <ArrowUpRight size={15} />
        </Link>
        <button
          id="public-menu-toggle"
          className="pub-menu-toggle"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="public-mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="public-mobile-menu"
          className="pub-mobile-nav"
          aria-label="Navigasi seluler"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
              <ArrowUpRight size={18} />
            </Link>
          ))}
          <Link href="/register">
            Buat akun gratis <ArrowUpRight size={18} />
          </Link>
        </nav>
      )}
      <motion.div
        className="pub-scroll-progress"
        style={{ scaleX: scrollYProgress }}
      />
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="pub-footer">
      <div className="pub-wrap">
        <div className="pub-footer-top">
          <div>
            <span className="pub-eyebrow">PELUANG BERIKUTNYA MENUNGGU.</span>
            <h2>
              MULAI DARI
              <br />
              SATU KONEKSI.
            </h2>
          </div>
          <Link
            className="pub-cta-orb"
            href="/register"
            aria-label="Mulai gratis"
          >
            <MoveUpRight />
            <span>LET’S GROW</span>
          </Link>
        </div>
        <div className="pub-footer-links">
          <div>
            <Brand />
            <p>
              Cari prospek. Bangun hubungan.
              <br />
              Beri bisnis ruang untuk tumbuh.
            </p>
          </div>
          <div>
            <span>JELAJAHI</span>
            <Link href="/#fitur">Produk</Link>
            <Link href="/#harga">Paket & harga</Link>
            <Link href="/#demo">Coba demo</Link>
          </div>
          <div>
            <span>PELAJARI</span>
            <Link href="/blog">Jurnal Hellens</Link>
            <Link href="/panduan">Panduan mulai</Link>
            <a href="/extension.zip" download>
              Unduh ekstensi
            </a>
          </div>
          <div>
            <span>MARI TERHUBUNG</span>
            <Link href="/register">Buat akun</Link>
            <Link href="/login">Masuk ke akun</Link>
            <a href="mailto:support@hellens.dev">support@hellens.dev ↗</a>
          </div>
        </div>
        <div className="pub-footer-bottom">
          <span>© {new Date().getFullYear()} Hellens.</span>
          <span>Dibuat untuk bisnis yang terus bergerak.</span>
          <a href="#main-content">Kembali ke atas ↑</a>
        </div>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <PublicMotion>
      <PublicHeader />
      {children}
      <PublicFooter />
    </PublicMotion>
  );
}

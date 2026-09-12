"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isNavActive, sectionForPath, tabsForPath } from "@/components/dashboard/nav-config";
import { useNavAccess } from "@/components/dashboard/nav-access";
import { TONE_SOFT } from "@/components/dashboard/section-tone";

interface PageHeroProps {
  title: string;
  description: string;
  /** Aksi halaman — tombol, tab, apa pun yang benar-benar bisa diklik. */
  rightSlot?: React.ReactNode;
  className?: string;
}

/**
 * Kepala halaman: penanda area, judul, satu kalimat penjelas, aksi di kanan.
 *
 * Area dan warnanya TIDAK lagi dioper tiap halaman. Dulu ke-18 halaman
 * menuliskan sendiri `kicker="Akun"` dan `tone="akun"` — 36 prop yang mengulang
 * sesuatu yang sudah diketahui nav-config, dan yang bisa melenceng dari menunya
 * begitu sebuah halaman dipindah grup. Sekarang keduanya dibaca dari pathname,
 * jadi kepala halaman mustahil tidak cocok dengan menu yang membawa ke sana.
 *
 * Sebelumnya kickernya berisi jargon Inggris — "Contact Intelligence",
 * "Number Hygiene", "Enrichment Engine" — di 14 dari 18 halaman. Itu kalimat
 * pertama yang dibaca orang di tiap halaman dan tidak berarti apa-apa bagi
 * yang belum terbiasa.
 */
export default function PageHero({ title, description, rightSlot, className }: PageHeroProps) {
  const pathname = usePathname();
  const { group, tone } = sectionForPath(pathname);
  const { featureFlags, planFeatures } = useNavAccess();

  // Tab saudara sekandung: halaman lain di menu yang sama. Sengaja dirender di
  // sini, bukan di tiap halaman — kepala halaman satu-satunya tempat yang
  // sudah dipakai ke-18 halaman, jadi tabnya cukup ditulis sekali.
  const tabs = (tabsForPath(pathname) ?? []).filter((t) => !t.flag || featureFlags?.[t.flag] !== false);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
              TONE_SOFT[tone],
            )}
          >
            {group}
          </span>
          <h1 className="cg-display mt-2.5 text-[clamp(1.75rem,2.8vw,2.35rem)]">{title}</h1>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>

      {tabs.length > 1 && (
        <nav aria-label="Bagian di menu ini" className="flex flex-wrap items-center gap-1 border-b border-border">
          {tabs.map((t) => {
            const active = isNavActive(pathname, t.href);
            const locked = Boolean(t.planFeature && planFeatures && planFeatures[t.planFeature] === false);

            // Tab terkunci tetap ditampilkan supaya orang tahu fiturnya ada,
            // tapi tidak bisa diklik: membuka halaman yang API-nya pasti
            // menolak cuma memindahkan kekecewaan satu klik lebih jauh.
            if (locked) {
              return (
                <span
                  key={t.href}
                  className="flex items-center gap-2 border-b-2 border-transparent px-3 pb-2.5 pt-1 text-sm font-medium text-muted-foreground"
                  title="Fitur ini ada di paket yang lebih tinggi"
                >
                  {t.label}
                  <span className="rounded bg-warning/15 px-1.5 py-0.5 text-xs font-semibold uppercase text-warning">
                    Bisnis
                  </span>
                </span>
              );
            }

            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px border-b-2 px-3 pb-2.5 pt-1 text-sm transition",
                  active
                    ? "border-foreground font-semibold text-foreground"
                    : "border-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

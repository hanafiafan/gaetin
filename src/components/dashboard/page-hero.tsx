"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isNavActive, sectionForPath, tabsForPath } from "@/components/dashboard/nav-config";
import { useNavAccess } from "@/components/dashboard/nav-access";
import { ChevronRight, Lock } from "lucide-react";

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
  const { group } = sectionForPath(pathname);
  const { featureFlags, planFeatures } = useNavAccess();

  // Tab saudara sekandung: halaman lain di menu yang sama. Sengaja dirender di
  // sini, bukan di tiap halaman — kepala halaman satu-satunya tempat yang
  // sudah dipakai ke-18 halaman, jadi tabnya cukup ditulis sekali.
  const tabs = (tabsForPath(pathname) ?? []).filter((t) => !t.flag || featureFlags?.[t.flag] !== false);

  return (
    <div className={cn("cg-page-hero space-y-5", className)}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <nav aria-label="Lokasi halaman" className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <a href="/dashboard" className="transition hover:text-foreground">Workspace</a>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span>{group}</span>
          </nav>
          <h1 className="cg-display mt-2.5 text-[clamp(1.75rem,2.8vw,2.35rem)]">{title}</h1>
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
        </div>
        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>

      {tabs.length > 1 && (
        <nav aria-label="Bagian di menu ini" className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 sm:rounded-full">
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
                  className="flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground"
                  title="Fitur ini ada di paket yang lebih tinggi"
                >
                  {t.label}
                  <Lock className="h-3.5 w-3.5" aria-label="Memerlukan peningkatan paket" />
                </span>
              );
            }

            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center rounded-full px-4 py-2 text-sm transition",
                  active
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "text-muted-foreground hover:bg-white/10 hover:text-foreground",
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

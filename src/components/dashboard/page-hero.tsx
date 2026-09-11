"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { sectionForPath } from "@/components/dashboard/nav-config";
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
  const { group, tone } = sectionForPath(usePathname());

  return (
    <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", className)}>
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
  );
}

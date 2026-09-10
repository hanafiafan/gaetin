"use client";

import { usePathname } from "next/navigation";
import { navGroups, isNavActive } from "@/components/dashboard/nav-config";
import { TONE_CANVAS, TONE_CARD, type SectionTone } from "@/components/dashboard/section-tone";
import { cn } from "@/lib/utils";

/**
 * Memberi warna kanvas halaman sesuai seksi yang sedang dibuka.
 *
 * Tone diturunkan dari navGroups, bukan dari peta rute tersendiri, supaya
 * warna halaman selalu cocok dengan item nav yang membawa user ke sana —
 * satu tempat saja yang perlu diubah saat menambah menu.
 */
function toneForPath(pathname: string): SectionTone {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isNavActive(pathname, item.href) && !item.skipActiveHighlight) return group.tone;
    }
  }
  return "primary";
}

export default function SectionCanvas({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const tone = toneForPath(pathname);
  return (
    <div
      className={cn("cg-app-surface flex-1 transition-colors duration-300", TONE_CANVAS[tone])}
      // Diwariskan ke seluruh subtree: setiap kartu ikut berona tanpa satu pun
      // halaman perlu disunting. Lihat TONE_CARD di section-tone.ts.
      style={{ "--card": TONE_CARD[tone] } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

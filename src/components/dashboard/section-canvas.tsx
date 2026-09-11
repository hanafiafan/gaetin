"use client";

import { usePathname } from "next/navigation";
import { navGroups, isNavActive } from "@/components/dashboard/nav-config";
import { type SectionTone } from "@/components/dashboard/section-tone";

/**
 * Lembar terang tempat isi halaman duduk, sekaligus satu-satunya tempat yang
 * menentukan warna area halaman yang sedang dibuka.
 *
 * Komponen ini membawa pola inti referensi: kerangka aplikasi tetap gelap
 * (bar navigasi dan kanvas di sekelilingnya), lalu SATU lembar terang besar
 * menampung seluruh isi halaman, dan bagian yang ditonjolkan justru kartu
 * gelap di dalamnya (lihat .cg-onyx).
 *
 * Warna areanya dipasang sebagai variabel --tone, bukan kelas per halaman.
 * Dua percobaan sebelumnya untuk "bikin lebih berwarna" gagal karena tiap
 * halaman mewarnai sendiri-sendiri dan hasilnya tidak konsisten; sekarang
 * komponen apa pun tinggal memakai .cg-tone-top dan otomatis dapat warna yang
 * benar untuk halamannya.
 */

const TONE_VAR: Record<SectionTone, string> = {
  primary: "var(--primary)",
  whatsapp: "var(--whatsapp)",
  email: "var(--email)",
  kelola: "var(--kelola)",
  akun: "var(--muted-foreground)",
};

export function toneForPath(pathname: string): SectionTone {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isNavActive(pathname, item.href) && !item.skipActiveHighlight) return group.tone;
    }
  }
  return "primary";
}

export default function SectionCanvas({ children }: { children: React.ReactNode }) {
  const tone = toneForPath(usePathname());
  return (
    <div
      className="cg-app-surface cg-sheet flex-1 rounded-t-[20px] border border-b-0 border-white/10 lg:rounded-t-[28px]"
      style={{ "--tone": TONE_VAR[tone] } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

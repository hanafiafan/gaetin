import { navGroups, isNavActive } from "@/components/dashboard/nav-config";
import { type SectionTone } from "@/components/dashboard/section-tone";

/**
 * Lembar terang tempat isi halaman duduk.
 *
 * Dulu komponen ini mewarnai kanvas DAN kartu tiap halaman sesuai seksinya.
 * Hasilnya keruh: hijau zaitun, ungu kelabu, kuning lumpur — dan kontras
 * antara kartu dan latarnya nyaris hilang karena keduanya sama-sama gelap
 * dan sama-sama berona.
 *
 * Sekarang komponen ini membawa pola inti referensi yang selama enam putaran
 * tidak pernah dikerjakan: kerangka aplikasi tetap gelap (bar navigasi dan
 * kanvas di sekelilingnya), lalu SATU lembar terang besar menampung seluruh
 * isi halaman, dan bagian yang ditonjolkan justru kartu gelap di dalamnya
 * (lihat .cg-onyx). Itulah yang memberi hierarki; versi gelap-di-atas-gelap
 * sebelumnya tidak punya.
 *
 * Warnanya sendiri seluruhnya dari token .cg-sheet di globals.css, jadi
 * ke-18 menu ikut berubah tanpa markup halaman disentuh.
 */
export function toneForPath(pathname: string): SectionTone {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isNavActive(pathname, item.href) && !item.skipActiveHighlight) return group.tone;
    }
  }
  return "primary";
}

export default function SectionCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="cg-app-surface cg-sheet flex-1 rounded-t-[20px] border border-b-0 border-white/10 lg:rounded-t-[28px]">
      {children}
    </div>
  );
}

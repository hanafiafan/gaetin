import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TONE_DOT, type SectionTone } from "@/components/dashboard/section-tone";

export type PageHeroTone = SectionTone;

interface PageHeroProps {
  kicker: string;
  kickerIcon: LucideIcon;
  title: string;
  description: string;
  tone?: PageHeroTone;
  /** Aksi halaman — tombol, tab, apa pun yang benar-benar bisa diklik. */
  rightSlot?: React.ReactNode;
  className?: string;
}

/**
 * Baris judul halaman: penanda seksi, judul, deskripsi singkat, aksi di kanan.
 *
 * Versi sebelumnya adalah blok tinggi dengan badge berwarna besar dan panel
 * dekoratif — referensinya jauh lebih ringkas: judul dan aksinya dalam satu
 * baris tipis, lalu langsung ke isi.
 */
export default function PageHero({
  kicker,
  kickerIcon: KickerIcon,
  title,
  description,
  tone = "primary",
  rightSlot,
  className,
}: PageHeroProps) {
  return (
    <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="min-w-0">
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[tone])} />
          <KickerIcon className="h-3.5 w-3.5" />
          {kicker}
        </span>
        <h1 className="cg-display mt-2 text-[clamp(1.5rem,2.4vw,2rem)]">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
}

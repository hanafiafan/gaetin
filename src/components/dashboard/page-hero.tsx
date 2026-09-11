import { cn } from "@/lib/utils";
import { TONE_SOFT, type SectionTone } from "@/components/dashboard/section-tone";

export type PageHeroTone = SectionTone;

interface PageHeroProps {
  /** Nama area di navigasi atas — Mulai / WhatsApp / Email / Kelola / Akun.
   * Menjawab "saya sedang di bagian mana", bukan slogan. */
  kicker: string;
  title: string;
  description: string;
  tone?: PageHeroTone;
  /** Aksi halaman — tombol, tab, apa pun yang benar-benar bisa diklik. */
  rightSlot?: React.ReactNode;
  className?: string;
}

/**
 * Kepala halaman: penanda area, judul, satu kalimat penjelas, aksi di kanan.
 *
 * Dua perubahan dari versi sebelumnya, keduanya soal keterbacaan:
 *
 * 1. Kickernya dulu jargon Inggris — "Contact Intelligence", "Number Hygiene",
 *    "Enrichment Engine" — di 14 dari 18 halaman. Itu kalimat PERTAMA yang
 *    dibaca orang di tiap halaman, dan tidak berarti apa-apa bagi yang belum
 *    terbiasa. Sekarang isinya nama area yang sama persis dengan menu di atas,
 *    berwarna sesuai areanya, sehingga berfungsi sebagai "kamu ada di sini".
 *
 * 2. Prop kickerIcon dihapus: 17 dari 18 halaman mengoper ikon Sparkles yang
 *    sama dan tidak menyampaikan apa pun.
 */
export default function PageHero({
  kicker,
  title,
  description,
  tone = "primary",
  rightSlot,
  className,
}: PageHeroProps) {
  return (
    <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="min-w-0">
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
            TONE_SOFT[tone],
          )}
        >
          {kicker}
        </span>
        <h1 className="cg-display mt-2.5 text-[clamp(1.75rem,2.8vw,2.35rem)]">{title}</h1>
        <p className="mt-2 max-w-3xl text-base leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
}

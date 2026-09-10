import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TONE_BG, TONE_SOFT, type SectionTone } from "@/components/dashboard/section-tone";

export type PageHeroTone = SectionTone;

export interface PageHeroFeature {
  icon: LucideIcon;
  label: string;
}

interface PageHeroProps {
  kicker: string;
  kickerIcon: LucideIcon;
  title: string;
  description: string;
  /** Section identity — matches the sidebar nav group this page belongs to. */
  tone?: PageHeroTone;
  /** Standard 3-row feature list on the right (most pages). Ignored if rightSlot is set. */
  features?: PageHeroFeature[];
  /** Custom right-side content (action buttons, jump-nav, etc.) instead of the feature list. */
  rightSlot?: React.ReactNode;
  className?: string;
}

/**
 * Shared header banner used across dashboard feature pages — extracted from the
 * identical markup that was hand-copied into ~14 pages (blast, campaigns, crm, ...).
 * One implementation now backs all of them, so a visual tweak here applies everywhere.
 */
export default function PageHero({
  kicker,
  kickerIcon: KickerIcon,
  title,
  description,
  tone = "primary",
  features,
  rightSlot,
  className,
}: PageHeroProps) {
  return (
    /* Baris judul ringkas, bukan pita warna selebar layar. Referensinya menaruh
       judul dan aksinya pada satu baris tipis lalu langsung masuk ke konten;
       pita tinggi berwarna memakan ruang layar tanpa menambah informasi. */
    <div className={cn("flex flex-col gap-5 pb-1 lg:flex-row lg:items-start lg:justify-between", className)}>
      <div className="min-w-0">
        <Badge className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider", TONE_BG[tone])}>
          <KickerIcon className="h-3.5 w-3.5" /> {kicker}
        </Badge>
        <h1 className="cg-display mt-3 text-[clamp(1.75rem,3vw,2.5rem)]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0 lg:w-[320px]">
        {rightSlot ?? (
          <div className="overflow-hidden rounded-xl border border-border">
            {features?.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 transition-colors duration-200 hover:bg-muted",
                  i > 0 && "border-t border-border",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                    TONE_SOFT[tone],
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="cg-label">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

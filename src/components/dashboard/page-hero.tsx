import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PageHeroFeature {
  icon: LucideIcon;
  label: string;
}

interface PageHeroProps {
  kicker: string;
  kickerIcon: LucideIcon;
  title: string;
  description: string;
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
  features,
  rightSlot,
  className,
}: PageHeroProps) {
  return (
    <Card className={cn("border-x-0 border-t-0 border-b border-foreground bg-transparent", className)}>
      <div className="grid gap-6 pb-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <div>
          <Badge className="cg-kicker rounded-none hover:bg-primary">
            <KickerIcon className="h-3.5 w-3.5" /> {kicker}
          </Badge>
          <h1 className="cg-display mt-5 text-[clamp(2rem,4.5vw,3.25rem)]">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {rightSlot ?? (
          <div className="grid gap-px bg-border">
            {features?.map(({ icon: Icon, label }) => (
              <div key={label} className="cg-label flex items-center gap-2.5 bg-background py-2.5">
                <Icon className="h-4 w-4 shrink-0" /> {label}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

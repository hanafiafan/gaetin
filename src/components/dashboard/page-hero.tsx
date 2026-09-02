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
    <Card className={cn("cg-card overflow-hidden rounded-2xl border-0", className)}>
      <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <Badge className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/15">
            <KickerIcon className="h-3.5 w-3.5" /> {kicker}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {rightSlot ?? (
          <div className="grid gap-2 text-sm">
            {features?.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"
              >
                <Icon className="h-4 w-4 text-primary" /> {label}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

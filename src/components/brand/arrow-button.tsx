import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Variant = "black" | "yellow" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  black: "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
  yellow: "bg-primary text-primary-foreground hover:bg-foreground hover:text-background",
  outline: "border border-foreground text-foreground hover:bg-foreground hover:text-background",
};

const SIZE: Record<Size, { box: string; icon: string }> = {
  sm: { box: "h-9 w-9", icon: "h-3.5 w-3.5" },
  md: { box: "h-12 w-12", icon: "h-5 w-5" },
  lg: { box: "h-16 w-16", icon: "h-6 w-6" },
};

interface ArrowButtonProps {
  href?: string;
  label: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  /**
   * Render as a plain span for use *inside* an existing link or button.
   * Nesting an <a> or <button> inside an <a> is invalid HTML and breaks
   * React hydration, so callers that already wrap this in a Link must set it.
   */
  decorative?: boolean;
}

/**
 * The circular ↗ affordance — the reference design's universal "go" control.
 * Renders as a link when `href` is given, a button otherwise, or an inert
 * span when `decorative`.
 */
export default function ArrowButton({
  href,
  label,
  variant = "black",
  size = "md",
  className = "",
  decorative = false,
}: ArrowButtonProps) {
  const classes = `cg-press inline-flex shrink-0 items-center justify-center rounded-full ${VARIANT[variant]} ${SIZE[size].box} ${className}`;
  const icon = <ArrowUpRight className={SIZE[size].icon} strokeWidth={2.5} />;

  if (decorative) {
    return (
      <span aria-hidden="true" className={classes}>
        {icon}
      </span>
    );
  }

  if (href) {
    return (
      <Link href={href} aria-label={label} className={classes}>
        {icon}
      </Link>
    );
  }

  return (
    <button type="button" aria-label={label} className={classes}>
      {icon}
    </button>
  );
}

import Link from "next/link";

const PLAN_CREDITS: Record<string, number> = { STARTER: 100, GROWTH: 2000, PRO: 6000 };
const PLAN_LABEL: Record<string, string> = { STARTER: "Starter", GROWTH: "Bisnis", PRO: "Pro" };

interface CreditsWidgetProps {
  credits: number;
  plan: string;
  subscriptionStatus: string;
  variant?: "full" | "compact";
}

/** Shared across Sidebar (full) and MobileNav (compact) — was previously copy-pasted in both. */
export default function CreditsWidget({ credits, plan, subscriptionStatus, variant = "full" }: CreditsWidgetProps) {
  const maxCredits = PLAN_CREDITS[plan] ?? 100;
  const creditPct = Math.min(100, Math.round((credits / maxCredits) * 100));
  const isLowCredits = credits < 50;
  const isTrial = subscriptionStatus === "TRIAL" || subscriptionStatus === "TRIAL_EXPIRED";

  if (variant === "compact") {
    return (
      <div className="mx-3 mt-3 rounded-xl border border-border p-3">
        <div className="flex items-center justify-between">
          <span className="cg-label text-muted-foreground">Kredit</span>
          <span className="cg-display text-lg">{credits.toLocaleString("id-ID")}</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${isLowCredits ? "bg-warning" : "bg-primary"}`}
            style={{ width: `${creditPct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-5 rounded-xl border p-3 ${isLowCredits ? "border-warning" : "border-border"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="cg-label text-muted-foreground">Kredit tersisa</span>
        <span className={`cg-label ${isTrial ? "text-muted-foreground" : ""}`}>
          {PLAN_LABEL[plan] ?? plan}
        </span>
      </div>
      <div className="cg-display mt-2 text-3xl">{credits.toLocaleString("id-ID")}</div>
      <div className="mt-2 h-1.5 rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${isLowCredits ? "bg-warning" : "bg-primary"}`}
          style={{ width: `${creditPct}%` }}
        />
      </div>
      <Link
        href="/dashboard/billing"
        className="cg-label mt-3 flex h-8 w-full items-center justify-center rounded-lg border border-foreground transition-colors duration-200 hover:bg-foreground hover:text-background"
      >
        {isLowCredits ? "Beli kredit" : "Kelola tagihan"}
      </Link>
    </div>
  );
}

import Link from "next/link";
import { Zap } from "lucide-react";

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
      <div className="mx-3 mt-3 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-foreground">Kredit</span>
          </div>
          <span className="text-sm font-black text-foreground">{credits.toLocaleString("id-ID")}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${creditPct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-3 rounded-2xl border p-3 ${isLowCredits ? "border-amber-500/30 bg-amber-500/10" : "border-primary/25 bg-primary/10"}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${isLowCredits ? "bg-amber-500/20 text-amber-300" : "gradient-primary text-foreground"}`}>
            <Zap className="h-3.5 w-3.5" />
          </div>
          <p className="text-xs font-bold text-foreground">Kredit tersisa</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isTrial ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary"}`}>
          {PLAN_LABEL[plan] ?? plan}
        </span>
      </div>
      <div className="mt-2 text-xl font-black text-foreground">{credits.toLocaleString("id-ID")}</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10">
        <div
          className={`h-full rounded-full transition-all ${isLowCredits ? "bg-amber-400" : "gradient-primary"}`}
          style={{ width: `${creditPct}%` }}
        />
      </div>
      <Link
        href="/dashboard/billing"
        className="mt-2 inline-flex h-7 w-full items-center justify-center rounded-full border border-border bg-card text-[11px] font-bold text-foreground transition hover:border-primary/45 hover:bg-primary/15"
      >
        {isLowCredits ? "⚠️ Beli kredit" : "Kelola tagihan"}
      </Link>
    </div>
  );
}

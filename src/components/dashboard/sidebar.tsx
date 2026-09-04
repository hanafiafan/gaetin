"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Lock, LogOut } from "lucide-react";
import type { PlanFeatures } from "@/config/plans";
import { navGroups, isNavActive, type NavItem } from "@/components/dashboard/nav-config";
import { TONE_BG, TONE_TEXT_DARK } from "@/components/dashboard/section-tone";
import UpgradeModal from "@/components/dashboard/upgrade-modal";
import CreditsWidget from "@/components/dashboard/credits-widget";

type SidebarProps = {
  appName?: string;
  featureFlags?: Record<string, boolean> | null;
  isSuperAdmin?: boolean;
  credits?: number;
  plan?: string;
  subscriptionStatus?: string;
  planFeatures?: PlanFeatures;
};

/* ── Sidebar ───────────────────────────────────────────────── */

export default function Sidebar({
  appName = "Hellens",
  featureFlags,
  isSuperAdmin = false,
  credits = 0,
  plan = "STARTER",
  subscriptionStatus = "TRIAL",
  planFeatures,
}: SidebarProps) {
  const pathname = usePathname();
  const [lockedFeature, setLockedFeature] = useState<string | null>(null);

  const isTrialExpired = subscriptionStatus === "TRIAL_EXPIRED";
  const isTrial = subscriptionStatus === "TRIAL" || isTrialExpired;

  function isItemLocked(item: NavItem): boolean {
    if (!item.planFeature) return false;
    if (!planFeatures) return false;
    return planFeatures[item.planFeature] === false;
  }

  return (
    <>
      <aside className="cg-invert sticky top-0 z-20 hidden h-screen w-[280px] shrink-0 flex-col border-r border-border px-4 py-5 lg:flex">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <img src="/brand/hellens-mark-white.png" alt="" className="h-7 w-7 shrink-0" />
          <span className="cg-display text-2xl">{appName}</span>
        </Link>

        <CreditsWidget credits={credits} plan={plan} subscriptionStatus={subscriptionStatus} />

        {/* Upgrade nudge — trial aktif dapat fitur penuh (dibatasi kredit); trial habis baru benar-benar terkunci */}
        {isTrial && (
          <Link
            href="/dashboard/billing"
            className="cg-label mt-4 flex items-center justify-between gap-2 rounded-lg border border-warning px-3 py-2.5 text-warning transition hover:bg-warning hover:text-warning-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              {isTrialExpired ? "Trial berakhir, fitur terkunci" : "Trial aktif — kredit terbatas"}
            </span>
            <span className="flex items-center gap-1 font-bold">Upgrade <ArrowRight className="h-3 w-3" /></span>
          </Link>
        )}

        <nav className="cg-scrollfade mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pb-6 pr-1">
          {navGroups.map((group) => {
            const items = group.items.filter((item) => !item.flag || featureFlags?.[item.flag] !== false);
            if (!items.length) return null;

            return (
              <div key={group.label}>
                <p className={`cg-label mb-1.5 transition-colors duration-200 ${TONE_TEXT_DARK[group.tone]}`}>{group.label}</p>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = isNavActive(pathname, item.href) && !item.skipActiveHighlight;
                    const locked = isItemLocked(item);

                    if (locked) {
                      return (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() => setLockedFeature(item.label)}
                          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:bg-muted"
                        >
                          <Icon className="h-4 w-4 shrink-0 opacity-40 transition-transform duration-200 group-hover:scale-110" />
                          <span className="flex-1 text-left opacity-50">{item.label}</span>
                          <Lock className="h-3 w-3 shrink-0 text-warning" />
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
                          active
                            ? TONE_BG[group.tone]
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="mt-2 shrink-0 border-t border-border pt-3">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-destructive"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Keluar (Logout)</span>
            </button>
          </form>
        </div>

        {isSuperAdmin && (
          <div className="mt-2 shrink-0 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="cg-label">Owner CMS</p>
                <p className="mt-1 text-[10px] text-muted-foreground">Kelola sistem Hellens.</p>
              </div>
              <Link
                href="/admin/cms"
                className="cg-label flex h-7 items-center justify-center rounded-lg border border-foreground px-3 transition hover:bg-foreground hover:text-background"
              >
                Buka
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Upgrade modal */}
      <UpgradeModal feature={lockedFeature} onClose={() => setLockedFeature(null)} />
    </>
  );
}

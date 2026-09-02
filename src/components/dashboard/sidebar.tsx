"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Lock, LogOut } from "lucide-react";
import type { PlanFeatures } from "@/config/plans";
import { navGroups, isNavActive, type NavItem } from "@/components/dashboard/nav-config";
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
      <aside className="sticky top-0 z-20 hidden h-screen w-[292px] shrink-0 border-r border-border bg-card/90 px-4 py-4 backdrop-blur-2xl lg:flex lg:flex-col">
        <Link href="/dashboard" className="cg-card flex items-center gap-3 rounded-3xl p-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-glow">
            <img src="/brand/hellens-mark-white.png" alt="Hellens" className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-black text-foreground">{appName}</span>
            <span className="block truncate text-xs font-medium text-muted-foreground">Sistem WhatsApp pelanggan</span>
          </span>
        </Link>

        <CreditsWidget credits={credits} plan={plan} subscriptionStatus={subscriptionStatus} />

        {/* Upgrade nudge — trial aktif dapat fitur penuh (dibatasi kredit); trial habis baru benar-benar terkunci */}
        {isTrial && (
          <Link
            href="/dashboard/billing"
            className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs font-semibold text-amber-400 transition hover:border-amber-500/40 hover:bg-amber-500/10"
          >
            <span className="flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              {isTrialExpired ? "Trial berakhir, fitur terkunci" : "Trial aktif — kredit terbatas"}
            </span>
            <span className="flex items-center gap-1 font-bold">Upgrade <ArrowRight className="h-3 w-3" /></span>
          </Link>
        )}

        <nav className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1 pb-4">
          {navGroups.map((group) => {
            const items = group.items.filter((item) => !item.flag || featureFlags?.[item.flag] !== false);
            if (!items.length) return null;

            return (
              <div key={group.label}>
                <p className="mb-2 px-3 text-[11px] font-bold uppercase text-muted-foreground">{group.label}</p>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = isNavActive(pathname, item.href);
                    const locked = isItemLocked(item);

                    if (locked) {
                      return (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() => setLockedFeature(item.label)}
                          className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm font-semibold text-muted-foreground transition hover:border-amber-500/15 hover:bg-amber-500/5"
                        >
                          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
                            <Icon className="h-4 w-4 opacity-40" />
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-card border border-amber-500/30">
                              <Lock className="h-2.5 w-2.5 text-amber-500" />
                            </span>
                          </span>
                          <span className="flex-1 text-left opacity-50">{item.label}</span>
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-600">
                            Bisnis
                          </span>
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                          active
                            ? "border border-primary/35 bg-primary/20 text-foreground shadow-glow"
                            : "border border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${active ? "gradient-primary text-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground"}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="mt-2 shrink-0 border-t border-border pt-4">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-red-400"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <LogOut className="h-4 w-4" />
              </span>
              <span>Keluar (Logout)</span>
            </button>
          </form>
        </div>

        {isSuperAdmin && (
          <div className="mt-2 shrink-0 rounded-2xl border border-border bg-muted p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">Owner CMS</p>
                <p className="text-[10px] text-muted-foreground">Kelola sistem Hellens.</p>
              </div>
              <Link
                href="/admin/cms"
                className="flex h-7 px-3 items-center justify-center rounded-full border border-border bg-card text-[10px] font-bold text-foreground transition hover:border-primary/45 hover:bg-primary/15"
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

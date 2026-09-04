"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, LogOut, Menu, Settings, X } from "lucide-react";
import type { PlanFeatures } from "@/config/plans";
import { navGroups, isNavActive, type NavItem } from "@/components/dashboard/nav-config";
import { TONE_TEXT } from "@/components/dashboard/section-tone";
import { cn } from "@/lib/utils";
import UpgradeModal from "@/components/dashboard/upgrade-modal";
import CreditsWidget from "@/components/dashboard/credits-widget";

type MobileNavProps = {
  appName?: string;
  featureFlags?: Record<string, boolean> | null;
  isSuperAdmin?: boolean;
  credits?: number;
  plan?: string;
  subscriptionStatus?: string;
  planFeatures?: PlanFeatures;
};

export default function MobileNav({
  appName = "Hellens",
  featureFlags,
  isSuperAdmin = false,
  credits = 0,
  plan = "STARTER",
  subscriptionStatus = "TRIAL",
  planFeatures,
}: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lockedFeature, setLockedFeature] = useState<string | null>(null);

  function isItemLocked(item: NavItem): boolean {
    if (!item.planFeature || !planFeatures) return false;
    return planFeatures[item.planFeature] === false;
  }

  const close = () => setOpen(false);

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-2xl text-primary-foreground lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={close} />
          <div className="absolute left-0 top-0 flex h-full w-[280px] flex-col overflow-y-auto bg-primary">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-foreground/15 px-4 py-4">
              <span className="text-base font-black text-foreground">{appName}</span>
              <button
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-foreground/60 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <CreditsWidget credits={credits} plan={plan} subscriptionStatus={subscriptionStatus} variant="compact" />

            {/* Nav */}
            <nav className="mt-4 flex-1 space-y-4 px-3 pb-4">
              {navGroups.map((group) => {
                const items = group.items.filter((item) => !item.flag || featureFlags?.[item.flag] !== false);
                if (!items.length) return null;
                return (
                  <div key={group.label}>
                    <p className="mb-1 px-2 text-[11px] font-bold uppercase text-foreground/55">{group.label}</p>
                    <div className="space-y-0.5">
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
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground/60 transition-colors duration-200 hover:bg-background/40"
                            >
                              <Icon className="h-4 w-4 opacity-40" />
                              <span className="flex-1 text-left opacity-50">{item.label}</span>
                              <span className="bg-warning/10 px-1.5 py-0.5 text-[9px] font-black uppercase text-warning">Bisnis</span>
                            </button>
                          );
                        }

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={close}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
                              active
                                ? "bg-background text-foreground shadow-sm"
                                : "text-foreground/70 hover:bg-background/40 hover:text-foreground",
                            )}
                          >
                            <Icon className={cn("h-4 w-4", active && TONE_TEXT[group.tone])} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="shrink-0 border-t border-foreground/15 p-3">
              {isSuperAdmin && (
                <Link
                  href="/admin"
                  onClick={close}
                  className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground transition hover:bg-background/40"
                >
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground/70 transition hover:bg-background/40 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade modal */}
      <UpgradeModal feature={lockedFeature} onClose={() => setLockedFeature(null)} />
    </>
  );
}

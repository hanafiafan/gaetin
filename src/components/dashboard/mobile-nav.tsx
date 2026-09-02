"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, LogOut, Menu, Settings, X } from "lucide-react";
import type { PlanFeatures } from "@/config/plans";
import { navGroups, isNavActive, type NavItem } from "@/components/dashboard/nav-config";
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
          <div className="absolute left-0 top-0 flex h-full w-[280px] flex-col overflow-y-auto border-r border-border bg-card">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="text-base font-black text-foreground">{appName}</span>
              <button
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground"
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
                    <p className="mb-1 px-2 text-[11px] font-bold uppercase text-muted-foreground">{group.label}</p>
                    <div className="space-y-0.5">
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
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-warning/5"
                            >
                              <Icon className="h-4 w-4 opacity-40" />
                              <span className="flex-1 text-left opacity-50">{item.label}</span>
                              <span className="rounded-full bg-warning/10 px-1.5 py-0.5 text-[9px] font-black uppercase text-warning">Bisnis</span>
                            </button>
                          );
                        }

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={close}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                              active
                                ? "bg-primary/20 text-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
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
            <div className="shrink-0 border-t border-border p-3">
              {isSuperAdmin && (
                <Link
                  href="/admin"
                  onClick={close}
                  className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground transition hover:bg-primary/10"
                >
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-destructive"
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, Lock, LogOut, ShieldCheck, Zap } from "lucide-react";
import type { PlanFeatures } from "@/config/plans";
import { navGroups, isNavActive, type NavItem } from "@/components/dashboard/nav-config";
import { cn } from "@/lib/utils";
import UpgradeModal from "@/components/dashboard/upgrade-modal";
import HeaderSearch from "@/components/dashboard/header-search";

/**
 * Navigasi atas berbentuk pil, menggantikan rail kiri.
 *
 * Referensinya memakai lima pil datar di puncak layar, sementara app ini punya
 * 19 tujuan dalam 5 grup. Memaksa 19 pil ke satu baris tidak akan terbaca,
 * jadi bentuknya dipetakan bertingkat: baris pertama memilih grup, baris kedua
 * menampilkan isi grup yang sedang aktif. Semua tujuan tetap terjangkau dalam
 * dua klik dan siluetnya sama dengan referensi.
 */

type Props = {
  appName?: string;
  user?: { name?: string | null; email?: string | null } | null;
  workspaceName?: string | null;
  planName?: string | null;
  credits?: number;
  featureFlags?: Record<string, boolean> | null;
  isSuperAdmin?: boolean;
  planFeatures?: PlanFeatures;
};

function initials(name?: string | null, email?: string | null) {
  const source = name || email || "Hellens User";
  return source
    .split(/[ @._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const ICON_BTN =
  "flex h-10 w-10 items-center justify-center rounded-xl border border-border text-foreground/80 transition hover:border-foreground/30 hover:bg-foreground/5 hover:text-foreground";

export default function WorkspaceNav({
  appName = "Hellens",
  user,
  workspaceName,
  planName,
  credits = 0,
  featureFlags,
  isSuperAdmin = false,
  planFeatures,
}: Props) {
  const pathname = usePathname();
  const [locked, setLocked] = useState<string | null>(null);

  const visible = navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.flag || featureFlags?.[i.flag] !== false) }))
    .filter((g) => g.items.length > 0);

  const activeGroup =
    visible.find((g) => g.items.some((i) => isNavActive(pathname, i.href) && !i.skipActiveHighlight)) ??
    visible[0];

  const isLocked = (item: NavItem) =>
    Boolean(item.planFeature && planFeatures && planFeatures[item.planFeature] === false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        {/* Baris 1 — merek, pemilih grup, aksi akun */}
        <div className="mx-auto flex min-h-[68px] max-w-[1600px] flex-wrap items-center gap-3 px-3 sm:px-5 lg:px-7">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
            <img src="/brand/hellens-mark-white.png" alt="" className="h-7 w-7" />
            <span className="text-lg font-semibold tracking-tight text-foreground">{appName}</span>
          </Link>

          <nav
            aria-label="Bagian utama"
            className="hidden items-center gap-1 rounded-full border border-border p-1 lg:flex"
          >
            {visible.map((g) => {
              const active = g.label === activeGroup?.label;
              return (
                <Link
                  key={g.label}
                  href={g.items[0].href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
                  )}
                >
                  {g.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <HeaderSearch />

            <Link
              href="/dashboard/billing"
              title="Kredit tersisa"
              className="hidden h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-foreground transition hover:border-foreground/30 sm:flex"
            >
              <Zap className="h-4 w-4 text-primary" />
              {credits.toLocaleString("id-ID")}
            </Link>

            {isSuperAdmin && (
              <Link href="/admin" className={ICON_BTN} title="Konsol Owner">
                <ShieldCheck className="h-4 w-4" />
              </Link>
            )}

            <button type="button" className={cn(ICON_BTN, "relative")} title="Notifikasi">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            </button>

            <form action="/api/auth/logout" method="POST" className="contents">
              <button type="submit" className={ICON_BTN} title="Keluar">
                <LogOut className="h-4 w-4" />
              </button>
            </form>

            <div className="flex items-center gap-2.5 rounded-xl border border-border py-1 pl-1 pr-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {initials(user?.name, user?.email)}
              </span>
              <span className="hidden min-w-0 leading-tight sm:block">
                <span className="block max-w-[140px] truncate text-sm font-semibold text-foreground">
                  {user?.name ?? "Owner"}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {workspaceName ?? "Workspace"}
                  {planName ? ` · ${planName}` : ""}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Baris 2 — isi grup aktif */}
        {activeGroup && activeGroup.items.length > 1 && (
          <div className="mx-auto hidden max-w-[1600px] px-3 pb-3 sm:px-5 lg:block lg:px-7">
            <nav aria-label={`Menu ${activeGroup.label}`} className="flex flex-wrap items-center gap-1.5">
              {activeGroup.items.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(pathname, item.href) && !item.skipActiveHighlight;
                if (isLocked(item)) {
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => setLocked(item.label)}
                      className="flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm text-foreground/45 transition hover:text-foreground/70"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                      <Lock className="h-3 w-3 text-warning" />
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition",
                      active
                        ? "border-primary/60 bg-primary/15 font-semibold text-foreground"
                        : "border-border text-foreground/70 hover:border-foreground/25 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <UpgradeModal feature={locked} onClose={() => setLocked(null)} />
    </>
  );
}

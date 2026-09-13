"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Lock, LogOut, ShieldCheck, Zap } from "lucide-react";
import type { PlanFeatures } from "@/config/plans";
import { navGroups, navItemMatches, navItemVisible, navItemHref, navItemLocked, type NavItem } from "@/components/dashboard/nav-config";
import { cn } from "@/lib/utils";
import UpgradeModal from "@/components/dashboard/upgrade-modal";
import HeaderSearch from "@/components/dashboard/header-search";

/**
 * Navigasi atas berbentuk pil.
 *
 * Dulu panelnya terbuka saat kursor lewat. Hover punya tiga masalah untuk
 * pengguna yang kurang terbiasa: panelnya hilang sendiri kalau kursor meleset
 * sedikit, tidak ada sama sekali di layar sentuh, dan tidak pernah memberi
 * konfirmasi bahwa menunya memang sudah dibuka. Sekarang dibuka dengan klik
 * dan bertahan sampai ditutup — klik di luar, tombol Escape, atau memilih
 * salah satu tujuan.
 *
 * Tiap tujuan membawa satu kalimat penjelas. Label seperti "Validator" atau
 * "CRM" tidak memberi tahu apa pun ke orang yang belum pernah memakai alat
 * sejenis, jadi labelnya diganti bahasa sehari-hari dan tetap ditemani
 * keterangan.
 */

type Props = {
  appName?: string;
  user?: { name?: string | null; email?: string | null } | null;
  workspaceName?: string | null;
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

/* Target sentuh 44px. Versi sebelumnya 40px, dan di badan halaman banyak yang
   32px — di bawah ambang yang nyaman untuk tangan yang kurang stabil. */
const ICON_BTN =
  "flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground/80 transition hover:border-foreground/30 hover:bg-foreground/5 hover:text-foreground";

export default function WorkspaceNav({
  appName = "Hellens",
  user,
  workspaceName,
  credits = 0,
  featureFlags,
  isSuperAdmin = false,
  planFeatures,
}: Props) {
  const pathname = usePathname();
  const [locked, setLocked] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Menu yang dibuka dengan klik butuh cara menutup yang jelas, kalau tidak ia
  // menjebak. Klik di luar dan Escape adalah dua cara yang sudah dikenal.
  useEffect(() => {
    if (!openGroup) return;
    const onPointer = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenGroup(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenGroup(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openGroup]);

  // Berpindah halaman harus menutup menunya; tanpa ini panel tetap menggantung
  // di atas halaman yang baru dibuka.
  useEffect(() => setOpenGroup(null), [pathname]);

  const visible = navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => navItemVisible(i, featureFlags)) }))
    .filter((g) => g.items.length > 0);

  const activeGroup =
    visible.find((g) => g.items.some((i) => navItemMatches(pathname, i))) ??
    visible[0];

  const isLocked = (item: NavItem) => navItemLocked(item, featureFlags, planFeatures);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-[56px] max-w-[1600px] flex-wrap items-center gap-2 px-3 sm:px-5 lg:px-7">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
            <Image width={28} height={28} src="/brand/hellens-mark-white.png" alt="" className="h-7 w-7" />
            <span className="text-lg font-semibold tracking-tight text-foreground">{appName}</span>
          </Link>

          <nav
            ref={navRef}
            aria-label="Bagian utama"
            className="hidden items-center gap-0.5 rounded-lg border border-border p-0.5 lg:flex"
          >
            {visible.map((g) => {
              const active = g.label === activeGroup?.label;
              const open = openGroup === g.label;

              // Grup berisi satu tujuan jadi tautan langsung. Dropdown yang
              // isinya cuma satu pilihan menambah satu klik tanpa menambah
              // satu pun keputusan.
              if (g.items.length === 1) {
                return (
                  <Link
                    key={g.label}
                    href={navItemHref(g.items[0], featureFlags)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-9 items-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground",
                    )}
                  >
                    {g.label}
                  </Link>
                );
              }

              return (
                <div key={g.label} className="relative">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="menu"
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpenGroup(open ? null : g.label)}
                    className={cn(
                      "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-sm font-medium transition",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground",
                    )}
                  >
                    {g.label}
                    <ChevronDown className={cn("h-4 w-4 opacity-60 transition-transform", open && "rotate-180")} />
                  </button>

                  {open && (
                    <div role="menu" className="absolute left-0 top-full z-40 pt-2">
                      <div className="w-[330px] overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-2xl">
                        {g.items.map((item) => {
                          const Icon = item.icon;
                          const itemActive = navItemMatches(pathname, item);
                          const itemLocked = isLocked(item);

                          const body = (
                            <>
                              <span
                                className={cn(
                                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                                  itemActive ? "bg-primary text-primary-foreground" : "bg-foreground/[0.07]",
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-1.5 font-semibold">
                                  {item.label}
                                  {itemLocked && <Lock className="h-3.5 w-3.5 text-warning" />}
                                </span>
                                <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
                                  {item.desc}
                                </span>
                              </span>
                            </>
                          );

                          if (itemLocked) {
                            return (
                              <button
                                key={item.href}
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setLocked(item.label);
                                  setOpenGroup(null);
                                }}
                                className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-foreground/50 transition hover:bg-foreground/5"
                              >
                                {body}
                              </button>
                            );
                          }
                          return (
                            <Link
                              key={item.href}
                              href={navItemHref(item, featureFlags)}
                              role="menuitem"
                              onClick={() => setOpenGroup(null)}
                              className={cn(
                                "flex items-start gap-3 rounded-lg px-3 py-2.5 transition",
                                itemActive
                                  ? "bg-primary/15 text-foreground"
                                  : "text-foreground/85 hover:bg-foreground/5 hover:text-foreground",
                              )}
                            >
                              {body}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <HeaderSearch />

            <Link
              href="/dashboard/billing"
              title="Sisa kredit — klik untuk beli tambahan"
              className="hidden h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-semibold text-foreground transition hover:border-foreground/30 sm:flex"
            >
              <Zap className="h-4 w-4 text-primary" />
              {credits.toLocaleString("id-ID")}
            </Link>

            {isSuperAdmin && (
              <Link href="/admin" className={ICON_BTN} title="Konsol Owner">
                <ShieldCheck className="h-4 w-4" />
              </Link>
            )}

            {/* Lonceng notifikasi dihapus. Tidak punya onClick, tidak punya
                endpoint, dan titik "ada notifikasi baru" menyala permanen —
                kontrol yang tampak hidup tapi mati adalah hal pertama yang
                dicoba pengguna baru. Sama seperti kolom pencarian yang dulu
                cuma <div> berbentuk kolom pencarian. */}

            <form action="/api/auth/logout" method="POST" className="contents">
              <button type="submit" className={ICON_BTN} title="Keluar dari akun">
                <LogOut className="h-4 w-4" />
              </button>
            </form>

            <div className="flex items-center gap-2 rounded-lg border border-border py-1 pl-1 pr-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                {initials(user?.name, user?.email)}
              </span>
              <span className="hidden min-w-0 max-w-[150px] leading-tight sm:block">
                <span className="block max-w-[130px] truncate text-sm font-semibold text-foreground">
                  {user?.name ?? "Owner"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {workspaceName ?? "Workspace"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <UpgradeModal feature={locked} onClose={() => setLocked(null)} />
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  CreditCard,
  FileText,
  Headphones,
  Inbox,
  LayoutDashboard,
  Lock,
  LogOut,
  Map,
  Megaphone,
  Menu,
  MessageSquareText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SquareKanban,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { PlanFeatures } from "@/config/plans";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  flag?: string;
  planFeature?: keyof PlanFeatures;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Data",
    items: [
      { label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
      { label: "Kontak", href: "/dashboard/contacts", icon: Users, flag: "contacts" },
      { label: "Scraper", href: "/dashboard/scraper", icon: Search, flag: "scraper" },
      { label: "Maps", href: "/dashboard/map", icon: Map, flag: "map" },
    ],
  },
  {
    label: "Pesan",
    items: [
      { label: "Blast", href: "/dashboard/blast", icon: Send, flag: "blast", planFeature: "blast" },
      { label: "Kampanye", href: "/dashboard/campaigns", icon: Megaphone, flag: "campaigns", planFeature: "campaigns" },
      { label: "CRM", href: "/dashboard/crm", icon: SquareKanban, flag: "crm", planFeature: "crmPipeline" },
      { label: "Inbox", href: "/dashboard/inbox", icon: Inbox, flag: "inbox", planFeature: "inbox" },
      { label: "Follow-up", href: "/dashboard/follow-ups", icon: MessageSquareText, flag: "followUps", planFeature: "autoFollowUp" },
      { label: "Tugas", href: "/dashboard/tasks", icon: CheckCircle2, flag: "tasks" },
    ],
  },
  {
    label: "Operasional",
    items: [
      { label: "Laporan", href: "/dashboard/analytics", icon: BarChart3, flag: "analytics" },
      { label: "Templates", href: "/dashboard/templates", icon: FileText, flag: "templates" },
      { label: "Validator", href: "/dashboard/validator", icon: ShieldCheck, flag: "validator", planFeature: "waValidation" },
      { label: "Tagihan", href: "/dashboard/billing", icon: CreditCard, flag: "billing" },
      { label: "Tim", href: "/dashboard/team", icon: Bot, flag: "team" },
      { label: "Bantuan", href: "/dashboard/support", icon: Headphones, flag: "support" },
      { label: "Pengaturan", href: "/dashboard/settings", icon: Settings, flag: "settings" },
    ],
  },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const PLAN_CREDITS: Record<string, number> = { STARTER: 100, GROWTH: 2000, PRO: 6000 };

type MobileNavProps = {
  appName?: string;
  featureFlags?: Record<string, boolean> | null;
  isSuperAdmin?: boolean;
  credits?: number;
  plan?: string;
  subscriptionStatus?: string;
  planFeatures?: PlanFeatures;
};

function UpgradeModal({ feature, onClose }: { feature: string | null; onClose: () => void }) {
  const router = useRouter();
  if (!feature) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#0d0f1e] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
            <Lock className="h-6 w-6" />
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/[0.06] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 pb-6">
          <h2 className="text-xl font-black text-white">{feature} butuh paket Bisnis</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Trial gratis hanya mencakup scraping Google Maps dan ekspor CSV.
          </p>
          <button
            onClick={() => { router.push("/dashboard/billing"); onClose(); }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            Upgrade Sekarang <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={onClose} className="mt-2 w-full rounded-full py-2.5 text-sm font-semibold text-slate-500 transition hover:text-slate-300">
            Nanti saja
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MobileNav({
  appName = "Gaetin",
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

  const maxCredits = PLAN_CREDITS[plan] ?? 100;
  const creditPct = Math.min(100, Math.round((credits / maxCredits) * 100));

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
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-2xl text-white lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={close} />
          <div className="absolute left-0 top-0 flex h-full w-[280px] flex-col overflow-y-auto border-r border-white/10 bg-[#050712]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <span className="text-base font-black text-white">{appName}</span>
              <button
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Credits mini card */}
            <div className="mx-3 mt-3 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold text-white">Kredit</span>
                </div>
                <span className="text-sm font-black text-white">{credits.toLocaleString("id-ID")}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${creditPct}%` }} />
              </div>
            </div>

            {/* Nav */}
            <nav className="mt-4 flex-1 space-y-4 px-3 pb-4">
              {navGroups.map((group) => {
                const items = group.items.filter((item) => !item.flag || featureFlags?.[item.flag] !== false);
                if (!items.length) return null;
                return (
                  <div key={group.label}>
                    <p className="mb-1 px-2 text-[11px] font-bold uppercase text-slate-500">{group.label}</p>
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
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-amber-500/5"
                            >
                              <Icon className="h-4 w-4 opacity-40" />
                              <span className="flex-1 text-left opacity-50">{item.label}</span>
                              <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-600">Bisnis</span>
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
                                ? "bg-primary/20 text-white"
                                : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
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
            <div className="shrink-0 border-t border-white/10 p-3">
              {isSuperAdmin && (
                <Link
                  href="/admin"
                  onClick={close}
                  className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-red-400"
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

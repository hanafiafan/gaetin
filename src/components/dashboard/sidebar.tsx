"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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

const PLAN_CREDITS: Record<string, number> = { STARTER: 100, GROWTH: 2000, PRO: 6000 };
const PLAN_LABEL: Record<string, string> = { STARTER: "Starter", GROWTH: "Bisnis", PRO: "Pro" };

type SidebarProps = {
  appName?: string;
  featureFlags?: Record<string, boolean> | null;
  isSuperAdmin?: boolean;
  credits?: number;
  plan?: string;
  subscriptionStatus?: string;
  planFeatures?: PlanFeatures;
};

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

/* ── Upgrade Modal ─────────────────────────────────────────── */

function UpgradeModal({ feature, onClose }: { feature: string | null; onClose: () => void }) {
  const router = useRouter();
  if (!feature) return null;

  const LOCKED_FEATURES = [
    "WhatsApp multi-nomor",
    "Blast & Campaign pesan",
    "CRM Pipeline & Follow-up otomatis",
    "Inbox & manajemen percakapan",
    "Validasi nomor WhatsApp",
    "2.000–6.000 kredit/bulan",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
            <Lock className="h-6 w-6" />
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-6">
          <h2 className="text-xl font-black text-foreground">
            {feature} butuh paket Bisnis
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Trial gratis hanya mencakup scraping Google Maps dan ekspor CSV. Upgrade untuk membuka seluruh fitur pemasaran.
          </p>

          {/* Features list */}
          <div className="mt-5 space-y-2">
            {LOCKED_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-foreground/80">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-[9px] font-black">✓</span>
                {f}
              </div>
            ))}
          </div>

          {/* Price teaser */}
          <div className="mt-5 rounded-2xl border border-primary/25 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">Paket Bisnis</p>
                <p className="text-xs text-muted-foreground">Mulai dari</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-foreground">Rp199K</p>
                <p className="text-xs text-muted-foreground">/bulan</p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <button
            onClick={() => { router.push("/dashboard/billing"); onClose(); }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            Upgrade Sekarang
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="mt-2 w-full rounded-full py-2.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            Nanti saja
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar ───────────────────────────────────────────────── */

export default function Sidebar({
  appName = "Gaetin",
  featureFlags,
  isSuperAdmin = false,
  credits = 0,
  plan = "STARTER",
  subscriptionStatus = "TRIAL",
  planFeatures,
}: SidebarProps) {
  const pathname = usePathname();
  const [lockedFeature, setLockedFeature] = useState<string | null>(null);

  const maxCredits = PLAN_CREDITS[plan] ?? 100;
  const creditPct = Math.min(100, Math.round((credits / maxCredits) * 100));
  const isLowCredits = credits < 50;
  const isTrial = subscriptionStatus === "TRIAL" || subscriptionStatus === "TRIAL_EXPIRED";

  function isItemLocked(item: NavItem): boolean {
    if (!item.planFeature) return false;
    if (!planFeatures) return false;
    return planFeatures[item.planFeature] === false;
  }

  return (
    <>
      <aside className="sticky top-0 z-20 hidden h-screen w-[292px] shrink-0 border-r border-border bg-card/90 px-4 py-4 backdrop-blur-2xl lg:flex lg:flex-col">
        <Link href="/dashboard" className="cg-card flex items-center gap-3 rounded-3xl p-3">
          <span className="gradient-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base font-black text-foreground shadow-glow">G</span>
          <span className="min-w-0">
            <span className="block text-base font-black text-foreground">{appName}</span>
            <span className="block truncate text-xs font-medium text-muted-foreground">Sistem WhatsApp pelanggan</span>
          </span>
        </Link>

        {/* Credits card */}
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

        {/* Upgrade nudge — show for trial users */}
        {isTrial && (
          <Link
            href="/dashboard/billing"
            className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs font-semibold text-amber-400 transition hover:border-amber-500/40 hover:bg-amber-500/10"
          >
            <span className="flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              Fitur WA & CRM terkunci
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
                <p className="text-[10px] text-muted-foreground">Kelola sistem Gaetin.</p>
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

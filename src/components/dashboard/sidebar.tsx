"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  CreditCard,
  FileText,
  Headphones,
  Inbox,
  LayoutDashboard,
  LogOut,
  Map,
  MessageSquare,
  MessageSquareText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  SquareKanban,
  Users,
  LogOut,
} from "lucide-react";

type SidebarProps = {
  appName?: string;
  featureFlags?: Record<string, boolean> | null;
  isSuperAdmin?: boolean;
};

const navGroups = [
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
      { label: "Blast", href: "/dashboard/blast", icon: Send, flag: "blast" },
      { label: "Kampanye", href: "/dashboard/campaigns", icon: Megaphone, flag: "campaigns" },
      { label: "CRM", href: "/dashboard/crm", icon: SquareKanban, flag: "crm" },
      { label: "Inbox", href: "/dashboard/inbox", icon: Inbox, flag: "inbox" },
      { label: "Follow-up", href: "/dashboard/follow-ups", icon: MessageSquareText, flag: "followUps" },
      { label: "Tugas", href: "/dashboard/tasks", icon: CheckCircle2, flag: "tasks" },
    ],
  },
  {
    label: "Operasional",
    items: [
      { label: "Laporan", href: "/dashboard/analytics", icon: BarChart3, flag: "analytics" },
      { label: "Templates", href: "/dashboard/templates", icon: FileText, flag: "templates" },
      { label: "Validator", href: "/dashboard/validator", icon: ShieldCheck, flag: "validator" },
      { label: "Tagihan", href: "/dashboard/billing", icon: CreditCard, flag: "billing" },
      { label: "Tim", href: "/dashboard/team", icon: Bot, flag: "team" },
      { label: "Bantuan", href: "/dashboard/support", icon: Headphones, flag: "support" },
      { label: "Pengaturan", href: "/dashboard/settings", icon: Settings, flag: "settings" },
    ],
  },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ appName = "Gaetin", featureFlags, isSuperAdmin = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-20 hidden h-screen w-[292px] shrink-0 border-r border-white/10 bg-[#050712]/88 px-4 py-4 backdrop-blur-2xl lg:flex lg:flex-col">
      <Link href="/dashboard" className="cg-card flex items-center gap-3 rounded-3xl p-3">
        <span className="gradient-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base font-black text-white shadow-glow">
          G
        </span>
        <span className="min-w-0">
          <span className="block text-base font-black text-white">{appName}</span>
          <span className="block truncate text-xs font-medium text-slate-400">Sistem WhatsApp pelanggan</span>
        </span>
      </Link>

      <div className="mt-4 rounded-3xl border border-primary/25 bg-primary/10 p-4">
        <div className="flex items-center gap-3">
          <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-2xl text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black text-white">Ringkasan kerja</p>
            <p className="text-xs text-slate-400">Kontak, pesan, dan tugas</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/10">
          <div className="gradient-primary h-2 w-[76%] rounded-full" />
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-5 overflow-y-auto pr-1 pb-4">
        {navGroups.map((group) => {
          const items = group.items.filter((item) => !item.flag || featureFlags?.[item.flag] !== false);

          if (!items.length) {
            return null;
          }

          return (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[11px] font-bold uppercase text-slate-500">{group.label}</p>
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = isNavActive(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                        active
                          ? "border border-primary/35 bg-primary/20 text-white shadow-glow"
                          : "border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                          active ? "gradient-primary text-white" : "bg-white/[0.05] text-slate-400 group-hover:text-white"
                        }`}
                      >
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

      <div className="mt-2 shrink-0 border-t border-white/10 pt-4">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-red-400"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-slate-400 transition group-hover:text-red-400">
              <LogOut className="h-4 w-4" />
            </span>
            <span>Keluar (Logout)</span>
          </button>
        </form>
      </div>

      {isSuperAdmin ? (
        <div className="mt-4 shrink-0 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-black text-white">Owner CMS</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Kelola fitur, aset, media, field pelanggan, dan laporan dari halaman admin.
          </p>
          <Link
            href="/admin/cms"
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-bold text-white transition hover:border-primary/45 hover:bg-primary/15"
          >
            Buka CMS
          </Link>
        </div>
      ) : null}
    </aside>
  );
}

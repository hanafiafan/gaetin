"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  Contact2,
  Database,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  Receipt,
  Settings2,
  Sparkles,
  Tags,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/workspaces", label: "Workspace", icon: Building2 },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/leads", label: "Data Scraping", icon: Database },
  { href: "/admin/contacts", label: "Kontak & Nomor", icon: Contact2 },
  { href: "/admin/transactions", label: "Transaksi", icon: Receipt },
  { href: "/admin/cms", label: "CMS Owner", icon: Settings2 },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/announcements", label: "Pengumuman", icon: Megaphone },
  { href: "/admin/plans", label: "Paket", icon: Tags },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-20 hidden h-screen w-[292px] shrink-0 border-r border-white/10 bg-[#050712]/88 px-4 py-4 backdrop-blur-2xl md:flex md:flex-col">
      <Link href="/admin" className="cg-card flex items-center gap-3 rounded-3xl p-3">
        <div className="gradient-primary flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black text-white shadow-glow">
          G
        </div>
        <div className="min-w-0">
          <div className="text-base font-black text-white">Gaetin</div>
          <div className="truncate text-xs font-medium text-slate-400">Konsol CMS Owner</div>
        </div>
      </Link>

      <div className="mt-4 rounded-3xl border border-primary/25 bg-primary/10 p-4">
        <div className="flex items-center gap-3">
          <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-2xl text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black text-white">Mode pemilik</p>
            <p className="text-xs text-slate-400">Kontrol sistem aktif</p>
          </div>
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-1 overflow-y-auto pr-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex min-h-12 items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-all",
                active
                  ? "border-primary/35 bg-primary/20 text-white shadow-glow"
                  : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition",
                  active ? "gradient-primary text-white" : "bg-white/[0.05] text-slate-400 group-hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-2 text-sm font-black text-white">
          <BarChart3 className="h-4 w-4 text-primary" />
          Laporan Penggunaan
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Pantau workspace, konten, paket, fitur, media, dan kebutuhan pelanggan dari satu tempat.
        </p>
        <Link
          href="/admin/cms"
          className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-bold text-white transition hover:border-primary/45 hover:bg-primary/15"
        >
          Buka CMS
        </Link>
      </div>
    </aside>
  );
}

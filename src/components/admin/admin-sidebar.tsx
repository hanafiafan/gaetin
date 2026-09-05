"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  Contact2,
  Database,
  KeyRound,
  LayoutDashboard,
  LineChart,
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
  { href: "/admin/analytics", label: "Analitik", icon: LineChart },
  { href: "/admin/workspaces", label: "Workspace", icon: Building2 },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/leads", label: "Data Scraping", icon: Database },
  { href: "/admin/contacts", label: "Kontak & Nomor", icon: Contact2 },
  { href: "/admin/transactions", label: "Transaksi", icon: Receipt },
  { href: "/admin/cms", label: "CMS Owner", icon: Settings2 },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/announcements", label: "Pengumuman", icon: Megaphone },
  { href: "/admin/plans", label: "Paket", icon: Tags },
  { href: "/admin/settings", label: "Integrasi", icon: KeyRound },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-20 hidden h-screen w-[280px] shrink-0 flex-col bg-primary px-4 py-5 md:flex">
      <Link href="/admin" className="flex items-center gap-2.5">
        <img src="/brand/hellens-mark-black.png" alt="" className="h-7 w-7 shrink-0" />
        <div className="min-w-0">
          <div className="cg-display text-2xl">Hellens</div>
          <div className="cg-label truncate text-foreground/55">Konsol Owner</div>
        </div>
      </Link>

      <div className="cg-card mt-5 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="cg-label">Mode pemilik</p>
            <p className="mt-1 text-[10px] text-muted-foreground">Kontrol sistem aktif</p>
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
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
                active
                  ? "cg-press bg-background text-foreground"
                  : "text-foreground/70 hover:bg-background/40 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="cg-card mt-4 rounded-lg p-4">
        <div className="cg-label flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Laporan Penggunaan
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Pantau workspace, konten, paket, fitur, media, dan kebutuhan pelanggan dari satu tempat.
        </p>
        <Link
          href="/admin/cms"
          className="cg-label cg-press mt-4 flex h-10 w-full items-center justify-center rounded-lg hover:bg-foreground hover:text-background"
        >
          Buka CMS
        </Link>
      </div>
    </aside>
  );
}

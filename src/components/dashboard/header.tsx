import Link from "next/link";
import { Bell, Command, Search, ShieldCheck, Sparkles } from "lucide-react";

type HeaderProps = {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  workspace?: {
    name?: string | null;
    subscription?: {
      plan?: {
        name?: string | null;
      } | null;
    } | null;
  } | null;
  isSuperAdmin?: boolean;
};

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || "Gaetin User";
  return source
    .split(/[ @._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Header({ user, workspace, isSuperAdmin = false }: HeaderProps) {
  const planName = workspace?.subscription?.plan?.name ?? "Bisnis";
  const workspaceName = workspace?.name ?? "Main Workspace";

  return (
    <header className="sticky top-4 z-30">
      <div className="cg-nav flex min-h-[76px] items-center justify-between gap-4 rounded-[1.75rem] px-4 py-3">
        <div className="flex min-w-0 items-center gap-4">
          <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-primary sm:flex">
            <Command className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-black text-white sm:text-xl">{workspaceName}</h1>
              <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {planName}
              </span>
            </div>
            <p className="mt-1 hidden text-sm text-slate-400 sm:block">Ringkasan kontak, pesan, CRM, CMS, dan laporan.</p>
          </div>
        </div>

        <div className="hidden min-w-[280px] max-w-md flex-1 items-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-400 xl:flex">
          <Search className="mr-3 h-4 w-4 text-slate-500" />
          Cari kontak, campaign, template, atau workspace
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin ? (
            <Link
              href="/admin"
              className="hidden h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-bold text-white transition hover:border-primary/40 hover:bg-primary/15 md:inline-flex"
            >
              <ShieldCheck className="h-4 w-4 text-primary" />
              Admin
            </Link>
          ) : null}

          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-slate-300 transition hover:border-primary/40 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
          </button>

          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] py-1 pl-1 pr-3">
            <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white">
              {getInitials(user?.name, user?.email)}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-[130px] truncate text-sm font-bold text-white">{user?.name ?? "Gaetin Owner"}</p>
              <p className="flex items-center gap-1 text-xs text-slate-400">
                <Sparkles className="h-3 w-3 text-primary" />
                Aktif
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

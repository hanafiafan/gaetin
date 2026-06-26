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
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-4 px-3 sm:px-5 lg:px-7">
        <div className="flex min-w-0 items-center gap-4">
          <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
            <Command className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-bold text-white sm:text-xl">{workspaceName}</h1>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {planName}
              </span>
            </div>
            <p className="hidden text-sm text-slate-400 sm:block">Ringkasan kontak, pesan, CRM, CMS, dan laporan.</p>
          </div>
        </div>

        <div className="hidden min-w-[280px] max-w-md flex-1 items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-slate-500 xl:flex">
          <Search className="mr-2 h-4 w-4" />
          Cari kontak, campaign, template, atau workspace
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin ? (
            <Link
              href="/admin"
              className="hidden h-10 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 text-sm font-semibold text-slate-300 transition hover:border-primary/30 hover:text-primary md:inline-flex"
            >
              <ShieldCheck className="h-4 w-4 text-primary" />
              Admin
            </Link>
          ) : null}

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] transition hover:border-white/15"
          >
            <Bell className="h-4 w-4 text-white" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-black" />
          </button>

          <div className="flex cursor-pointer items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.04] py-1 pl-1 pr-3 transition hover:border-white/15">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-black">
              {getInitials(user?.name, user?.email)}
            </div>
            <div className="hidden min-w-0 text-left sm:block">
              <p className="max-w-[130px] truncate text-sm font-semibold text-white">{user?.name ?? "Gaetin Owner"}</p>
              <p className="flex items-center gap-1 text-xs font-medium text-slate-400">
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

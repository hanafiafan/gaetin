import Link from "next/link";
import { Bell, Search, ShieldCheck } from "lucide-react";

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
  const source = name || email || "Hellens User";
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
    <header className="sticky top-0 z-30 border-b border-foreground bg-background">
      <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-4 px-3 sm:px-5 lg:px-7">
        <div className="flex min-w-0 items-center gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="cg-display truncate text-2xl text-foreground sm:text-3xl">{workspaceName}</h1>
              <span className="cg-highlight cg-label">{planName}</span>
            </div>
            <p className="cg-label mt-1 hidden text-muted-foreground sm:block">
              Kontak · Pesan · CRM · Laporan
            </p>
          </div>
        </div>

        <div className="hidden min-w-[280px] max-w-md flex-1 items-center border border-border px-4 py-2.5 text-sm text-muted-foreground xl:flex">
          <Search className="mr-2 h-4 w-4" />
          Cari kontak, campaign, template, atau workspace
        </div>

        <div className="flex items-center gap-2">
          {isSuperAdmin ? (
            <Link
              href="/admin"
              className="cg-label hidden h-10 items-center gap-2 rounded-lg border border-foreground px-4 text-foreground transition hover:bg-foreground hover:text-background md:inline-flex"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          ) : null}

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center border border-border transition hover:border-foreground"
          >
            <Bell className="h-4 w-4 text-foreground" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </button>

          <div className="flex cursor-pointer items-center gap-3 border border-border py-1 pl-1 pr-3 transition hover:border-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
              {getInitials(user?.name, user?.email)}
            </div>
            <div className="hidden min-w-0 text-left sm:block">
              <p className="max-w-[130px] truncate text-sm font-bold text-foreground">
                {user?.name ?? "Hellens Owner"}
              </p>
              <p className="cg-label text-muted-foreground">Aktif</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

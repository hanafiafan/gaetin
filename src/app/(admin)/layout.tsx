import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth/session";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSuperAdmin();
  return (
    <div className="cg-shell flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-foreground bg-background px-5 py-3 lg:px-7">
          <div>
            <span className="cg-display text-xl">Pengaturan Owner</span>
            <p className="cg-label mt-1 text-muted-foreground">CMS · Pelanggan · Paket · Laporan</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted-foreground sm:inline">{session.user.name}</span>
            <Link href="/dashboard" className="cg-label border border-foreground px-4 py-2.5 transition hover:bg-foreground hover:text-background">
              Ke dashboard
            </Link>
          </div>
        </header>
        <main className="relative z-10 flex-1 p-3 sm:p-5 lg:p-7">{children}</main>
      </div>
    </div>
  );
}

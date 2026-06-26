import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth/session";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSuperAdmin();
  return (
    <div className="cg-shell flex min-h-screen bg-[#050712] text-white">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-4 z-20 mx-3 mt-4 flex min-h-16 items-center justify-between gap-4 rounded-[1.75rem] border border-white/10 bg-[#050712]/80 px-5 py-3 shadow-glow backdrop-blur-2xl sm:mx-5 lg:mx-7">
          <div>
            <span className="text-sm font-black text-white">Pengaturan Owner</span>
            <p className="text-xs text-slate-400">CMS, pelanggan, paket, dan laporan penggunaan Gaetin.</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-400 sm:inline">{session.user.name}</span>
            <Link href="/dashboard" className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 font-bold text-white transition hover:border-primary/40 hover:bg-primary/15">
              Ke dashboard
            </Link>
          </div>
        </header>
        <main className="relative z-10 flex-1 p-3 sm:p-5 lg:p-7">{children}</main>
      </div>
    </div>
  );
}

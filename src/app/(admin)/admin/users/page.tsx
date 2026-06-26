import AdminUsers from "@/components/admin/admin-users";
import { ShieldCheck, Sparkles, Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="space-y-5">
      <div className="cg-card rounded-2xl p-6">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Identity Control</span>
        <h1 className="text-3xl font-bold tracking-tight text-white">User</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">Cari user, kunci akun, atau jadikan super-admin.</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><Users className="h-4 w-4 text-primary" /> User registry</span>
          <span className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><ShieldCheck className="h-4 w-4 text-primary" /> Admin privilege</span>
        </div>
      </div>
      <AdminUsers />
    </div>
  );
}

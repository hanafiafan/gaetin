import AdminUsers from "@/components/admin/admin-users";
import { ShieldCheck, Sparkles, Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="space-y-5">
      <div className="cg-card rounded-2xl p-6">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-foreground"><Sparkles className="h-3.5 w-3.5" /> Identity Control</span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">User</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Cari user, kunci akun, atau jadikan super-admin.</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-foreground"><Users className="h-4 w-4 text-foreground" /> User registry</span>
          <span className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-foreground"><ShieldCheck className="h-4 w-4 text-foreground" /> Admin privilege</span>
        </div>
      </div>
      <AdminUsers />
    </div>
  );
}

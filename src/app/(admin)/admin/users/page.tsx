import AdminUsers from "@/components/admin/admin-users";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Sparkles, Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10"><Sparkles className="h-3.5 w-3.5" /> Identity Control</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">User</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Cari user, kunci akun, atau jadikan super-admin.</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Users className="h-4 w-4 text-primary" /> User registry</span>
          <span className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><ShieldCheck className="h-4 w-4 text-primary" /> Admin privilege</span>
        </div>
      </div>
      <AdminUsers />
    </div>
  );
}

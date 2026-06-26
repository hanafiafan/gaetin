import AdminWorkspaces from "@/components/admin/admin-workspaces";
import { Badge } from "@/components/ui/badge";
import { Building2, Coins, Sparkles } from "lucide-react";

export default function AdminWorkspacesPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10"><Sparkles className="h-3.5 w-3.5" /> Tenant Control</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Workspace</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Kelola semua tenant: paket, kredit, status, dan impersonasi.</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Building2 className="h-4 w-4 text-primary" /> Multi-tenant</span>
          <span className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Coins className="h-4 w-4 text-primary" /> Credit control</span>
        </div>
      </div>
      <AdminWorkspaces />
    </div>
  );
}

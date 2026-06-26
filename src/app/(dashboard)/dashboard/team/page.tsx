import TeamClient from "@/components/dashboard/team-client";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Sparkles, UserPlus, Users2 } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10"><Sparkles className="h-3.5 w-3.5" /> Workspace Access</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Tim</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Kelola anggota workspace dan perannya. Hanya Owner/Admin yang bisa menambah atau mengubah.</p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Users2 className="h-4 w-4 text-primary" /> Multi-user workspace</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><ShieldCheck className="h-4 w-4 text-primary" /> Role Owner/Admin/Agent</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><UserPlus className="h-4 w-4 text-primary" /> Undang anggota tim</div>
          </div>
        </div>
      </div>
      <TeamClient />
    </div>
  );
}

import TeamClient from "@/components/dashboard/team-client";
import { ShieldCheck, Sparkles, UserPlus, Users2 } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="space-y-5">
      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Workspace Access</span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Tim</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Kelola anggota workspace dan perannya. Hanya Owner/Admin yang bisa menambah atau mengubah.</p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><Users2 className="h-4 w-4 text-primary" /> Multi-user workspace</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><ShieldCheck className="h-4 w-4 text-primary" /> Role Owner/Admin/Agent</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><UserPlus className="h-4 w-4 text-primary" /> Undang anggota tim</div>
          </div>
        </div>
      </div>
      <TeamClient />
    </div>
  );
}

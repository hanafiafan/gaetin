import EmailBlastClient from "@/components/dashboard/email-blast-client";
import { Mail, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function EmailBlastPage() {
  await requirePlanFeature("emailBlast");
  return (
    <div className="space-y-5">
      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Outreach Engine</span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Email Blast</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Kirim email personal ke kontak yang punya alamat email, dengan personalisasi dan progress yang mudah dipantau.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><Mail className="h-4 w-4 text-primary" /> Target otomatis ke kontak yang punya email</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><Wand2 className="h-4 w-4 text-primary" /> Mendukung personalisasi dan spintax</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><ShieldCheck className="h-4 w-4 text-primary" /> Perlu provider email aktif di Admin &gt; Integrasi</div>
          </div>
        </div>
      </div>
      <EmailBlastClient />
    </div>
  );
}

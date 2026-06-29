import BlastClient from "@/components/dashboard/blast-client";
import { MessageSquareText, Send, ShieldCheck, Sparkles } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function BlastPage() {
  await requirePlanFeature("blast");
  return (
    <div className="space-y-5">
      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Outreach Engine</span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">WhatsApp Blast</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Kirim pesan personal ke segmen kontak dengan jeda aman, variasi teks, dan progress yang mudah dipantau.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><Send className="h-4 w-4 text-primary" /> Blast cepat untuk campaign satu kali</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><MessageSquareText className="h-4 w-4 text-primary" /> Mendukung personalisasi dan spintax</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><ShieldCheck className="h-4 w-4 text-primary" /> Disarankan hanya ke kontak consent/aktif</div>
          </div>
        </div>
      </div>
      <BlastClient />
    </div>
  );
}

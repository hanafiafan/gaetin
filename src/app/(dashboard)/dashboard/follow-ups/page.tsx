import FollowUpsClient from "@/components/dashboard/followups-client";
import { Bot, Clock, Repeat, Sparkles } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function FollowUpsPage() {
  await requirePlanFeature("autoFollowUp");
  return (
    <div className="space-y-5">
      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Automation</span>
            <h1 className="text-3xl font-bold tracking-tight text-white">Follow-up Otomatis</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Buat aturan tindak lanjut untuk kontak yang belum membalas. Rangkaian berhenti saat kontak membalas.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><Repeat className="h-4 w-4 text-primary" /> No-reply follow-up</div>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><Bot className="h-4 w-4 text-primary" /> Otomasi berbasis aturan</div>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><Clock className="h-4 w-4 text-primary" /> Cron-ready untuk produksi</div>
          </div>
        </div>
      </div>
      <FollowUpsClient />
    </div>
  );
}

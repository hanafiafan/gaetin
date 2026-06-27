import CampaignsClient from "@/components/dashboard/campaigns-client";
import { CalendarClock, Megaphone, PauseCircle, Sparkles } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function CampaignsPage() {
  await requirePlanFeature("campaigns");
  return (
    <div className="space-y-5">
      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Campaign Manager</span>
            <h1 className="text-3xl font-bold tracking-tight text-white">Kampanye</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Rencanakan outreach terjadwal, pilih template, pause/resume saat dibutuhkan, dan pantau progress pengiriman.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><CalendarClock className="h-4 w-4 text-primary" /> Jadwalkan campaign minimal 5 menit ke depan</div>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><PauseCircle className="h-4 w-4 text-primary" /> Pause dan lanjutkan progress</div>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><Megaphone className="h-4 w-4 text-primary" /> Cocok untuk follow-up promo dan edukasi</div>
          </div>
        </div>
      </div>
      <CampaignsClient />
    </div>
  );
}

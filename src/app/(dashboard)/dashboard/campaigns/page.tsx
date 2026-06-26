import CampaignsClient from "@/components/dashboard/campaigns-client";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Megaphone, PauseCircle, Sparkles } from "lucide-react";

export default function CampaignsPage() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10">
              <Sparkles className="h-3.5 w-3.5" />
              Campaign Manager
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Kampanye</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Rencanakan outreach terjadwal, pilih template, pause/resume saat dibutuhkan, dan pantau progress pengiriman.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              Jadwalkan campaign minimal 5 menit ke depan
            </div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
              <PauseCircle className="h-4 w-4 text-primary" />
              Pause dan lanjutkan progress
            </div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
              <Megaphone className="h-4 w-4 text-primary" />
              Cocok untuk follow-up promo dan edukasi
            </div>
          </div>
        </div>
      </div>
      <CampaignsClient />
    </div>
  );
}

import FollowUpsClient from "@/components/dashboard/followups-client";
import { Badge } from "@/components/ui/badge";
import { Bot, Clock, Repeat, Sparkles } from "lucide-react";

export default function FollowUpsPage() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10">
              <Sparkles className="h-3.5 w-3.5" />
              Automation
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Follow-up Otomatis</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Buat aturan tindak lanjut untuk kontak yang belum membalas. Rangkaian berhenti saat kontak membalas.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Repeat className="h-4 w-4 text-primary" /> No-reply follow-up</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Bot className="h-4 w-4 text-primary" /> Otomasi berbasis aturan</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Clock className="h-4 w-4 text-primary" /> Cron-ready untuk produksi</div>
          </div>
        </div>
      </div>
      <FollowUpsClient />
    </div>
  );
}

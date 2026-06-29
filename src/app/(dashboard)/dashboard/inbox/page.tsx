import InboxClient from "@/components/dashboard/inbox-client";
import { Headphones, MessageSquare, Sparkles, UserCheck } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function InboxPage() {
  await requirePlanFeature("inbox");
  return (
    <div className="space-y-5">
      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Conversation Hub</span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Inbox</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Balasan WhatsApp masuk di sini. Balas cepat, ubah status percakapan, dan jaga momentum closing.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><MessageSquare className="h-4 w-4 text-primary" /> Percakapan dua arah</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><UserCheck className="h-4 w-4 text-primary" /> Status open, pending, resolved</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><Headphones className="h-4 w-4 text-primary" /> Cocok untuk sales dan customer support</div>
          </div>
        </div>
      </div>
      <InboxClient />
    </div>
  );
}

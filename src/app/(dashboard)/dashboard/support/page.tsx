import SupportClient from "@/components/dashboard/support-client";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, LifeBuoy, MessageCircleQuestion, Sparkles } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10"><Sparkles className="h-3.5 w-3.5" /> Help Center</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Bantuan</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Lihat FAQ, dokumentasi ringkas, atau kirim tiket bila butuh bantuan.</p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><HelpCircle className="h-4 w-4 text-primary" /> FAQ produk</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><LifeBuoy className="h-4 w-4 text-primary" /> Tiket support</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><MessageCircleQuestion className="h-4 w-4 text-primary" /> Panduan fitur</div>
          </div>
        </div>
      </div>
      <SupportClient />
    </div>
  );
}

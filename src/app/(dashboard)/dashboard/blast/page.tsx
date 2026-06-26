import BlastClient from "@/components/dashboard/blast-client";
import { Badge } from "@/components/ui/badge";
import { MessageSquareText, Send, ShieldCheck, Sparkles } from "lucide-react";

export default function BlastPage() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10">
              <Sparkles className="h-3.5 w-3.5" />
              Outreach Engine
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">WhatsApp Blast</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Kirim pesan personal ke segmen kontak dengan jeda aman, variasi teks, dan progress yang mudah dipantau.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
              <Send className="h-4 w-4 text-primary" />
              Blast cepat untuk campaign satu kali
            </div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
              <MessageSquareText className="h-4 w-4 text-primary" />
              Mendukung personalisasi dan spintax
            </div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Disarankan hanya ke kontak consent/aktif
            </div>
          </div>
        </div>
      </div>
      <BlastClient />
    </div>
  );
}

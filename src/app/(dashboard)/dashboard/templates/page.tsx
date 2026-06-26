import TemplatesClient from "@/components/dashboard/templates-client";
import { Badge } from "@/components/ui/badge";
import { Braces, FileText, Sparkles, Wand2 } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10"><Sparkles className="h-3.5 w-3.5" /> Message Library</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Template Pesan</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Simpan pesan yang sering dipakai untuk blast, campaign, dan follow-up.</p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Braces className="h-4 w-4 text-primary" /> Personalisasi {"{{nama}}"}</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Wand2 className="h-4 w-4 text-primary" /> Spintax {"{a|b}"}</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><FileText className="h-4 w-4 text-primary" /> Reusable copy library</div>
          </div>
        </div>
      </div>
      <TemplatesClient />
    </div>
  );
}

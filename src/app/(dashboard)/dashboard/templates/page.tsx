import TemplatesClient from "@/components/dashboard/templates-client";
import { Braces, FileText, Sparkles, Wand2 } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="space-y-5">
      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Message Library</span>
            <h1 className="text-3xl font-bold tracking-tight text-white">Template Pesan</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Simpan pesan yang sering dipakai untuk blast, campaign, dan follow-up.</p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><Braces className="h-4 w-4 text-primary" /> Personalisasi {"{{nama}}"}</div>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><Wand2 className="h-4 w-4 text-primary" /> Spintax {"{a|b}"}</div>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><FileText className="h-4 w-4 text-primary" /> Reusable copy library</div>
          </div>
        </div>
      </div>
      <TemplatesClient />
    </div>
  );
}

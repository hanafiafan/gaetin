import SupportClient from "@/components/dashboard/support-client";
import { HelpCircle, LifeBuoy, MessageCircleQuestion, Sparkles } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-5">
      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Help Center</span>
            <h1 className="text-3xl font-bold tracking-tight text-white">Bantuan</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Lihat FAQ, dokumentasi ringkas, atau kirim tiket bila butuh bantuan.</p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><HelpCircle className="h-4 w-4 text-primary" /> FAQ produk</div>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><LifeBuoy className="h-4 w-4 text-primary" /> Tiket support</div>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><MessageCircleQuestion className="h-4 w-4 text-primary" /> Panduan fitur</div>
          </div>
        </div>
      </div>
      <SupportClient />
    </div>
  );
}

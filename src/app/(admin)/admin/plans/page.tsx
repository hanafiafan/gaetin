import AdminPlansEditor from "@/components/admin/admin-plans-editor";
import { Coins, Sparkles, Tags } from "lucide-react";

export default function AdminPlansPage() {
  return (
    <div className="space-y-5">
      <div className="cg-card rounded-2xl p-6">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Monetization CMS</span>
        <h1 className="text-3xl font-bold tracking-tight text-white">Paket & Harga</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Atur harga, jatah kredit, diskon tahunan, dan paket top-up. Berlaku langsung di landing & halaman langganan.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><Tags className="h-4 w-4 text-primary" /> Plan catalog</span>
          <span className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><Coins className="h-4 w-4 text-primary" /> Credit packs</span>
        </div>
      </div>
      <AdminPlansEditor />
    </div>
  );
}

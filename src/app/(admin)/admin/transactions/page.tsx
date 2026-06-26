import AdminTransactions from "@/components/admin/admin-transactions";
import { Receipt, Sparkles, WalletCards } from "lucide-react";

export default function AdminTransactionsPage() {
  return (
    <div className="space-y-5">
      <div className="cg-card rounded-2xl p-6">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Revenue Operations</span>
        <h1 className="text-3xl font-bold tracking-tight text-white">Transaksi</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">Semua transaksi pembayaran dari seluruh workspace.</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><Receipt className="h-4 w-4 text-primary" /> Subscription & top-up</span>
          <span className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-slate-300"><WalletCards className="h-4 w-4 text-primary" /> Payment status</span>
        </div>
      </div>
      <AdminTransactions />
    </div>
  );
}

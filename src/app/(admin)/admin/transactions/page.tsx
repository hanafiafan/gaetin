import AdminTransactions from "@/components/admin/admin-transactions";
import { Receipt, Sparkles, WalletCards } from "lucide-react";

export default function AdminTransactionsPage() {
  return (
    <div className="space-y-5">
      <div className="cg-card rounded-2xl p-6">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-foreground"><Sparkles className="h-3.5 w-3.5" /> Revenue Operations</span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Transaksi</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Semua transaksi pembayaran dari seluruh workspace.</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-foreground"><Receipt className="h-4 w-4 text-foreground" /> Subscription & top-up</span>
          <span className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-foreground"><WalletCards className="h-4 w-4 text-foreground" /> Payment status</span>
        </div>
      </div>
      <AdminTransactions />
    </div>
  );
}

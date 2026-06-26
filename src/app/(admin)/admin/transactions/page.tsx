import AdminTransactions from "@/components/admin/admin-transactions";
import { Badge } from "@/components/ui/badge";
import { Receipt, Sparkles, WalletCards } from "lucide-react";

export default function AdminTransactionsPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10"><Sparkles className="h-3.5 w-3.5" /> Revenue Operations</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Transaksi</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Semua transaksi pembayaran dari seluruh workspace.</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Receipt className="h-4 w-4 text-primary" /> Subscription & top-up</span>
          <span className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><WalletCards className="h-4 w-4 text-primary" /> Payment status</span>
        </div>
      </div>
      <AdminTransactions />
    </div>
  );
}

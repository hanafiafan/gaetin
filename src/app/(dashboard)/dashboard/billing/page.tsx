import BillingClient from "@/components/dashboard/billing-client";
import { CreditCard, Coins, Receipt, Sparkles } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-5">
      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Subscription</span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Langganan & Kredit</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Kelola paket, saldo kredit, dan top-up. Pembayaran via Xendit (VA, e-wallet, QRIS).</p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><CreditCard className="h-4 w-4 text-primary" /> Subscription bulanan/tahunan</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><Coins className="h-4 w-4 text-primary" /> Kredit untuk pemakaian variabel</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><Receipt className="h-4 w-4 text-primary" /> Riwayat transaksi</div>
          </div>
        </div>
      </div>
      <BillingClient />
    </div>
  );
}

import BillingClient from "@/components/dashboard/billing-client";
import PageHero from "@/components/dashboard/page-hero";
import { CreditCard, Coins, Receipt, Sparkles } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-5">
      <PageHero
        tone="akun"
        kicker="Subscription"
        kickerIcon={Sparkles}
        title="Langganan & Kredit"
        description="Kelola paket, saldo kredit, dan top-up. Pembayaran via Midtrans (VA, e-wallet, QRIS)."
        features={[
          { icon: CreditCard, label: "Subscription bulanan/tahunan" },
          { icon: Coins, label: "Kredit untuk pemakaian variabel" },
          { icon: Receipt, label: "Riwayat transaksi" },
        ]}
      />
      <BillingClient />
    </div>
  );
}

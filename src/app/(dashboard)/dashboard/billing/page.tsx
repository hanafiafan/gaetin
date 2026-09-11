import BillingClient from "@/components/dashboard/billing-client";
import PageHero from "@/components/dashboard/page-hero";
import { CreditCard, Coins, Receipt, Sparkles } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-5">
      <PageHero
        title="Tagihan & Kredit"
        description="Lihat paket langganan dan sisa kreditmu. Bisa bayar lewat transfer bank, e-wallet, atau QRIS."
      />
      <BillingClient />
    </div>
  );
}

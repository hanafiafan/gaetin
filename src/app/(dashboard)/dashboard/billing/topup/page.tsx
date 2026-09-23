import BillingClient from "@/components/dashboard/billing-client";
import PageHero from "@/components/dashboard/page-hero";

export default function BillingTopupPage() {
  return (
    <div className="space-y-5">
      <PageHero title="Top-up Kredit" description="Tambahkan kredit kapan saja melalui transfer bank, e-wallet, QRIS, atau metode lain yang tersedia di Midtrans." />
      <BillingClient view="topup" />
    </div>
  );
}

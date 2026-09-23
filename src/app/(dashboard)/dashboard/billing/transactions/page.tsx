import BillingClient from "@/components/dashboard/billing-client";
import PageHero from "@/components/dashboard/page-hero";

export default function BillingTransactionsPage() {
  return (
    <div className="space-y-5">
      <PageHero title="Riwayat Transaksi" description="Pantau status pembayaran paket dan top-up, atau lanjutkan invoice Midtrans yang masih menunggu pembayaran." />
      <BillingClient view="transactions" />
    </div>
  );
}

import BillingClient from "@/components/dashboard/billing-client";
import PageHero from "@/components/dashboard/page-hero";

export default function BillingPlansPage() {
  return (
    <div className="space-y-5">
      <PageHero title="Pilih Paket" description="Pilih paket dan siklus pembayaran. Checkout akan dibuka melalui halaman pembayaran aman Midtrans." />
      <BillingClient view="plans" />
    </div>
  );
}

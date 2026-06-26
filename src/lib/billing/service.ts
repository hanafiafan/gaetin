import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { createInvoice } from "@/lib/xendit/client";
import { addCredits } from "@/lib/credits/service";
import { getEffectivePlans, calcPrice } from "@/lib/plans-store";
import type { PlanId, BillingCycle } from "@/config/plans";

const APP_URL = env.NEXT_PUBLIC_APP_URL;

async function activateSubscription(workspaceId: string, plan: PlanId, cycle: BillingCycle) {
  const { plans } = await getEffectivePlans();
  const ep = plans.find((p) => p.id === plan) ?? plans[0];
  const months = cycle === "YEARLY" ? 12 : 1;
  const end = new Date();
  end.setMonth(end.getMonth() + months);
  await prisma.subscription
    .update({ where: { workspaceId }, data: { plan, billingCycle: cycle, status: "ACTIVE", currentPeriodEnd: end } })
    .catch(() => undefined);
  await addCredits(workspaceId, ep.monthlyCredits, "PLAN_ALLOCATION");
}

export async function createSubscriptionCheckout(
  workspaceId: string,
  payerEmail: string,
  plan: PlanId,
  cycle: BillingCycle,
): Promise<{ invoiceUrl?: string; free?: boolean }> {
  const { plans, yearlyDiscount } = await getEffectivePlans();
  const ep = plans.find((p) => p.id === plan) ?? plans[0];
  const amount = calcPrice(ep.monthlyPrice, cycle, yearlyDiscount);

  if (amount <= 0) {
    await activateSubscription(workspaceId, plan, cycle);
    return { free: true };
  }
  const orderId = `SUB-${workspaceId}-${Date.now()}`;
  await prisma.transaction.create({
    data: { workspaceId, orderId, kind: "SUBSCRIPTION", plan, billingCycle: cycle, grossAmount: amount, status: "PENDING" },
  });
  const inv = await createInvoice({
    externalId: orderId,
    amount,
    description: `Langganan ${ep.name} (${cycle === "YEARLY" ? "Tahunan" : "Bulanan"})`,
    payerEmail,
    successRedirectUrl: `${APP_URL}/dashboard/billing?paid=1`,
  });
  await prisma.transaction.updateMany({ where: { orderId }, data: { snapToken: inv.id, invoiceUrl: inv.invoiceUrl } });
  return { invoiceUrl: inv.invoiceUrl };
}

export async function createTopupCheckout(
  workspaceId: string,
  payerEmail: string,
  packId: string,
): Promise<{ invoiceUrl: string }> {
  const { topupPacks } = await getEffectivePlans();
  const pack = topupPacks.find((p) => p.id === packId);
  if (!pack) throw new Error("PACK_NOT_FOUND");
  const orderId = `TOPUP-${workspaceId}-${Date.now()}`;
  await prisma.transaction.create({
    data: { workspaceId, orderId, kind: "TOPUP", credits: pack.credits, grossAmount: pack.price, status: "PENDING" },
  });
  const inv = await createInvoice({
    externalId: orderId,
    amount: pack.price,
    description: `Top-up ${pack.credits.toLocaleString("id-ID")} kredit`,
    payerEmail,
    successRedirectUrl: `${APP_URL}/dashboard/billing?paid=1`,
  });
  await prisma.transaction.updateMany({ where: { orderId }, data: { snapToken: inv.id, invoiceUrl: inv.invoiceUrl } });
  return { invoiceUrl: inv.invoiceUrl };
}

/** Idempotent: aktifkan langganan / tambah kredit saat invoice lunas. */
export async function handlePaidTransaction(orderId: string): Promise<void> {
  const tx = await prisma.transaction.findUnique({ where: { orderId } });
  if (!tx || tx.status === "PAID") return;

  await prisma.transaction.update({ where: { id: tx.id }, data: { status: "PAID", paidAt: new Date() } });

  if (tx.kind === "TOPUP") {
    await addCredits(tx.workspaceId, tx.credits, "TOPUP");
  } else if (tx.plan) {
    await activateSubscription(tx.workspaceId, tx.plan, tx.billingCycle ?? "MONTHLY");
  }
}

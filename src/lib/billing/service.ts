import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";
import { createTransaction } from "@/lib/midtrans/client";
import { addCreditsInTransaction } from "@/lib/credits/service";
import type { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { addMonths } from "date-fns";
import { getEffectivePlans, calcPrice } from "@/lib/plans-store";
import type { PlanId, BillingCycle } from "@/config/plans";

const APP_URL = env.NEXT_PUBLIC_APP_URL;

async function activateSubscription(tx: Prisma.TransactionClient, workspaceId: string, plan: PlanId, cycle: BillingCycle, credits: number) {
  const current = await tx.subscription.findUnique({ where: { workspaceId } });
  const now = new Date();
  const base = current?.plan === plan && current.status === "ACTIVE" && current.currentPeriodEnd && current.currentPeriodEnd > now
    ? current.currentPeriodEnd : now;
  const currentPeriodEnd = addMonths(base, cycle === "YEARLY" ? 12 : 1);
  const data = { plan, billingCycle: cycle, status: "ACTIVE" as const, currentPeriodEnd, scheduledDowngradePlanId: null };
  await tx.subscription.upsert({ where: { workspaceId }, update: data, create: { workspaceId, ...data } });
  await addCreditsInTransaction(tx, workspaceId, credits, "PLAN_ALLOCATION");
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
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Workspace" WHERE id = ${workspaceId} FOR UPDATE`;
      const current = await tx.subscription.findUnique({ where: { workspaceId } });
      // A free checkout must not reset a paid period or farm free credits.
      if (current?.status === "ACTIVE" && current.currentPeriodEnd && current.currentPeriodEnd > new Date()) {
        if (current.plan !== plan) throw new Error("Paket aktif belum berakhir; hubungi admin untuk perubahan paket.");
        return;
      }
      await activateSubscription(tx, workspaceId, plan, "MONTHLY", ep.monthlyCredits);
    });
    return { free: true };
  }
  const orderId = `SUB-${workspaceId}-${randomUUID()}`;
  await prisma.transaction.create({
    data: { workspaceId, orderId, kind: "SUBSCRIPTION", plan, billingCycle: cycle, allocationCredits: ep.monthlyCredits * (cycle === "YEARLY" ? 12 : 1), grossAmount: amount, status: "PENDING" },
  });
  const tx = await createTransaction({
    orderId,
    amount,
    description: `Langganan ${ep.name} (${cycle === "YEARLY" ? "Tahunan" : "Bulanan"})`,
    payerEmail,
    successRedirectUrl: `${APP_URL}/dashboard/billing?paid=1`,
  });
  await prisma.transaction.updateMany({ where: { orderId }, data: { snapToken: tx.token, invoiceUrl: tx.redirectUrl } });
  return { invoiceUrl: tx.redirectUrl };
}

export async function createTopupCheckout(
  workspaceId: string,
  payerEmail: string,
  packId: string,
): Promise<{ invoiceUrl: string }> {
  const { topupPacks } = await getEffectivePlans();
  const pack = topupPacks.find((p) => p.id === packId);
  if (!pack) throw new Error("PACK_NOT_FOUND");
  const orderId = `TOPUP-${workspaceId}-${randomUUID()}`;
  await prisma.transaction.create({
    data: { workspaceId, orderId, kind: "TOPUP", credits: pack.credits, grossAmount: pack.price, status: "PENDING" },
  });
  const tx = await createTransaction({
    orderId,
    amount: pack.price,
    description: `Top-up ${pack.credits.toLocaleString("id-ID")} kredit`,
    payerEmail,
    successRedirectUrl: `${APP_URL}/dashboard/billing?paid=1`,
  });
  await prisma.transaction.updateMany({ where: { orderId }, data: { snapToken: tx.token, invoiceUrl: tx.redirectUrl } });
  return { invoiceUrl: tx.redirectUrl };
}

/** Settlement and benefits commit together; retries cannot observe partial fulfilment. */
export async function handlePaidTransaction(orderId: string, grossAmount?: string): Promise<void> {
  // Legacy invoices did not snapshot credits; resolve their allocation before taking locks.
  const { plans } = await getEffectivePlans();
  await prisma.$transaction(async (db) => {
    const invoice = await db.transaction.findUnique({ where: { orderId } });
    if (!invoice) throw new Error("INVOICE_NOT_FOUND");
    await db.$queryRaw`SELECT id FROM "Workspace" WHERE id = ${invoice.workspaceId} FOR UPDATE`;
    const tx = await db.transaction.findUniqueOrThrow({ where: { orderId } });
    if (grossAmount !== undefined && !tx.grossAmount.equals(grossAmount)) throw new Error("AMOUNT_MISMATCH");
    if (tx.status === "PAID") return;
    if (tx.kind === "TOPUP") {
      await addCreditsInTransaction(db, tx.workspaceId, tx.credits, "TOPUP");
    } else if (tx.kind === "SUBSCRIPTION" && tx.plan) {
      const plan = plans.find((p) => p.id === tx.plan);
      if (!plan) throw new Error("PLAN_NOT_FOUND");
      const cycle = tx.billingCycle ?? "MONTHLY";
      const credits = tx.allocationCredits ?? plan.monthlyCredits * (cycle === "YEARLY" ? 12 : 1);
      await activateSubscription(db, tx.workspaceId, tx.plan, cycle, credits);
    } else throw new Error("INVALID_INVOICE_KIND");
    await db.transaction.update({ where: { orderId }, data: { status: "PAID", paidAt: new Date() } });
  });
}

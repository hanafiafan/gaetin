import { prisma } from "@/lib/db/prisma";
import { addCreditsInTransaction, deductCreditsInTransaction } from "@/lib/credits/service";
import { getMessagingProvider } from "@/lib/messaging/provider";
import { CREDIT_COSTS, PLANS } from "@/config/plans";
import { dayStart, DailyMessagingQuotaError } from "@/lib/messaging/quota";
import { getWorkspacePlan } from "@/lib/plans/limits";

export class DeliveryBlockedError extends Error {}
export interface DeliveryInput { id: string; workspaceId: string; accountId: string; contactId: string; followUp?: boolean; text: string; media?: import("@/lib/messaging/provider").MessageMedia }

/** Reserve balance and daily capacity once, then use the same gateway receipt on every retry. */
export async function deliverWhatsApp(input: DeliveryInput) {
  const plan = await getWorkspacePlan(input.workspaceId);
  if (!PLANS[plan.id].features.blast) throw new DeliveryBlockedError("Paket tidak mendukung pengiriman WhatsApp");
  const row = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Workspace" WHERE id = ${input.workspaceId} FOR UPDATE`;
    const existing = await tx.outboundDelivery.findUnique({ where: { id: input.id } });
    if (existing) {
      if (existing.workspaceId !== input.workspaceId || existing.accountId !== input.accountId || existing.contactId !== input.contactId) throw new Error("DELIVERY_CONFLICT");
      if (existing.status === "PENDING") {
        const contact = await tx.contact.findUnique({ where: { id: input.contactId } });
        if (!contact || await tx.doNotContact.findUnique({ where: { workspaceId_phone: { workspaceId: input.workspaceId, phone: contact.phone } } })) {
          throw new DeliveryBlockedError("Opt-out: pengiriman tertunda memerlukan pemeriksaan hasil sebelumnya");
        }
      }
      return existing;
    }
    const contact = await tx.contact.findFirst({ where: { id: input.contactId, workspaceId: input.workspaceId } });
    const account = await tx.messagingAccount.findFirst({ where: { id: input.accountId, workspaceId: input.workspaceId } });
    if (!contact || !account) throw new DeliveryBlockedError("Kontak atau akun pengirim tidak tersedia");
    if (await tx.doNotContact.findUnique({ where: { workspaceId_phone: { workspaceId: input.workspaceId, phone: contact.phone } } })) throw new DeliveryBlockedError("Opt-out (Do-Not-Contact)");
    if (account.status !== "CONNECTED") throw new DeliveryBlockedError("Akun WhatsApp belum terhubung");
    const today = dayStart();
    const used = await tx.outboundDelivery.count({ where: { workspaceId: input.workspaceId, channel: "WHATSAPP", status: { not: "FAILED" }, createdAt: { gte: today } } });
    if (used >= plan.limits.campaignDailyLimit) throw new DailyMessagingQuotaError(plan.limits.campaignDailyLimit);
    const count = account.sentTodayResetAt && account.sentTodayResetAt >= today ? account.sentToday : 0;
    if (count >= account.dailyLimit) throw new DailyMessagingQuotaError(account.dailyLimit);
    await deductCreditsInTransaction(tx, input.workspaceId, CREDIT_COSTS.sendWhatsApp, "SEND_WHATSAPP");
    await tx.messagingAccount.update({ where: { id: account.id }, data: { sentToday: count + 1, sentTodayResetAt: today } });
    return tx.outboundDelivery.create({ data: { id: input.id, workspaceId: input.workspaceId, contactId: input.contactId, accountId: input.accountId, channel: "WHATSAPP", cost: CREDIT_COSTS.sendWhatsApp } });
  });
  if (row.status !== "PENDING") return row;
  const contact = await prisma.contact.findFirst({ where: { id: input.contactId, workspaceId: input.workspaceId } });
  if (!contact) throw new Error("CONTACT_REMOVED_DURING_DELIVERY");
  // Network failure is retryable with the same receipt. An uncertain gateway result is terminal.
  const result = await getMessagingProvider().sendMessage(input.accountId, contact.phone, { text: input.text, media: input.media, idempotencyKey: input.id });
  if (result.retryable) throw new Error(result.error ?? "GATEWAY_UNAVAILABLE");
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Workspace" WHERE id = ${input.workspaceId} FOR UPDATE`;
    const current = await tx.outboundDelivery.findUniqueOrThrow({ where: { id: input.id } });
    if (current.status !== "PENDING") return current;
    const status = result.ok ? "SENT" : result.uncertain ? "UNKNOWN" : "FAILED";
    if (status === "FAILED") {
      await addCreditsInTransaction(tx, input.workspaceId, current.cost, "REFUND_SEND_WHATSAPP");
      await tx.messagingAccount.updateMany({ where: { id: input.accountId, sentTodayResetAt: dayStart(current.createdAt), sentToday: { gt: 0 } }, data: { sentToday: { decrement: 1 } } });
    }
    if (result.ok) await tx.contact.update({ where: { id: contact.id }, data: { lastContacted: new Date(), ...(input.followUp ? {} : { lastOutboundAt: new Date() }) } });
    return tx.outboundDelivery.update({ where: { id: input.id }, data: { status, waMessageId: result.waMessageId, error: result.error } });
  });
}

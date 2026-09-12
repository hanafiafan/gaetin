import { prisma } from "@/lib/db/prisma";
import { addCreditsInTransaction } from "@/lib/credits/service";
import { dayStart } from "./quota";

/** Explicit operator confirmation, never an automatic retry of an ambiguous send. */
export async function reconcileDelivery(id: string, status: "SENT" | "FAILED", userId: string, note: string) {
  return prisma.$transaction(async (tx) => {
    const initial = await tx.outboundDelivery.findUnique({ where: { id } });
    if (!initial) throw new Error("NOT_FOUND");
    await tx.$queryRaw`SELECT id FROM "Workspace" WHERE id = ${initial.workspaceId} FOR UPDATE`;
    const row = await tx.outboundDelivery.findUniqueOrThrow({ where: { id } });
    if (row.status === status) return row;
    const age = Date.now() - row.updatedAt.getTime();
    if (!(row.status === "UNKNOWN" && age >= 300_000) && !(row.status === "PENDING" && age >= 86_400_000)) throw new Error("NOT_RECONCILABLE");
    if (status === "FAILED") {
      await addCreditsInTransaction(tx, row.workspaceId, row.cost, `REFUND_CONFIRMED_${row.channel}`);
      if (row.accountId) await tx.messagingAccount.updateMany({ where: { id: row.accountId, sentTodayResetAt: dayStart(row.createdAt), sentToday: { gt: 0 } }, data: { sentToday: { decrement: 1 } } });
    }
    if (status === "SENT" && row.channel === "WHATSAPP" && !id.startsWith("FOLLOW_UP:")) {
      await tx.contact.updateMany({ where: { id: row.contactId, OR: [{ lastOutboundAt: null }, { lastOutboundAt: { lt: row.createdAt } }] }, data: { lastOutboundAt: row.createdAt } });
    }
    const sourceId = id.substring(id.indexOf(":") + 1);
    const data = { status, errorReason: status === "FAILED" ? note : null, sentAt: status === "SENT" ? row.createdAt : null };
    if (id.startsWith("CAMPAIGN:")) {
      const m = await tx.campaignMessage.findUnique({ where: { id: sourceId } });
      if (m) {
        await tx.campaignMessage.update({ where: { id: sourceId }, data });
        const sentCount = await tx.campaignMessage.count({ where: { campaignId: m.campaignId, status: { in: ["SENT", "DELIVERED", "READ"] } } });
        const failedCount = await tx.campaignMessage.count({ where: { campaignId: m.campaignId, status: "FAILED" } });
        await tx.campaign.update({ where: { id: m.campaignId }, data: { sentCount, failedCount } });
      }
    } else if (id.startsWith("BLAST:")) {
      const m = await tx.blastMessage.findUnique({ where: { id: sourceId } });
      if (m) {
        await tx.blastMessage.update({ where: { id: sourceId }, data });
        const sentCount = await tx.blastMessage.count({ where: { blastId: m.blastId, status: { in: ["SENT", "DELIVERED", "READ"] } } });
        const failedCount = await tx.blastMessage.count({ where: { blastId: m.blastId, status: "FAILED" } });
        await tx.blast.update({ where: { id: m.blastId }, data: { sentCount, failedCount } });
      }
    } else if (id.startsWith("FOLLOW_UP:")) await tx.followUpSchedule.updateMany({ where: { id: sourceId }, data });
    else if (id.startsWith("INBOX:")) await tx.inboxMessage.updateMany({ where: { id }, data: { status } });
    else if (id.startsWith("EMAIL_BLAST:")) {
      const m = await tx.emailBlastMessage.findUnique({ where: { id: sourceId } });
      if (m) {
        await tx.emailBlastMessage.update({ where: { id: sourceId }, data });
        const sentCount = await tx.emailBlastMessage.count({ where: { emailBlastId: m.emailBlastId, status: { in: ["SENT", "DELIVERED", "READ"] } } });
        const failedCount = await tx.emailBlastMessage.count({ where: { emailBlastId: m.emailBlastId, status: "FAILED" } });
        await tx.emailBlast.update({ where: { id: m.emailBlastId }, data: { sentCount, failedCount } });
      }
    }
    await tx.auditLog.create({ data: { workspaceId: row.workspaceId, userId, action: "DELIVERY_RECONCILED", target: JSON.stringify({ id, status, note }) } });
    return tx.outboundDelivery.update({ where: { id }, data: { status, error: status === "FAILED" ? note : null } });
  });
}

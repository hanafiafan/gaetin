import { prisma } from "@/lib/db/prisma";
import { deliverWhatsApp, DeliveryBlockedError } from "./delivery";
import { renderMessage } from "./text";
import { InsufficientCreditsError } from "@/lib/credits/service";
import { DailyMessagingQuotaError } from "./quota";
import { enqueue } from "@/lib/jobs/queue";

/** Small batches allow the worker to interleave campaigns and due follow-ups. */
export async function runBroadcast(kind: "CAMPAIGN" | "BLAST", id: string) {
  const campaign = kind === "CAMPAIGN";
  const job = campaign ? await prisma.campaign.findUnique({ where: { id } }) : await prisma.blast.findUnique({ where: { id } });
  if (!job || job.status !== (campaign ? "ACTIVE" : "RUNNING")) return;
  const accountId = "accountId" in job ? job.accountId : (job.variables as { accountId?: string } | null)?.accountId;
  const template = "messageTemplate" in job ? job.messageTemplate : job.messageText ?? "";
  const pause = async () => {
    if (campaign) await prisma.campaign.updateMany({ where: { id, status: "ACTIVE" }, data: { status: "PAUSED" } });
    else await prisma.blast.updateMany({ where: { id, status: "RUNNING" }, data: { status: "STOPPED" } });
  };
  if (!accountId) { await pause(); return; }
  const messages = campaign
    ? await prisma.campaignMessage.findMany({ where: { campaignId: id, status: "PENDING" }, include: { contact: true }, orderBy: { createdAt: "asc" }, take: 10 })
    : await prisma.blastMessage.findMany({ where: { blastId: id, status: "PENDING" }, include: { contact: true }, orderBy: { createdAt: "asc" }, take: 10 });
  for (const m of messages) {
    const state = campaign ? await prisma.campaign.findUnique({ where: { id } }) : await prisma.blast.findUnique({ where: { id } });
    if (state?.status !== (campaign ? "ACTIVE" : "RUNNING")) break;
    let status: "SENT" | "FAILED" = "FAILED";
    let error: string | null = null;
    try {
      const delivery = await deliverWhatsApp({ id: `${kind}:${m.id}`, workspaceId: job.workspaceId, accountId, contactId: m.contactId,
        text: renderMessage(template, { nama: m.contact.name, name: m.contact.name, kota: m.contact.city, phone: m.contact.phone }) });
      status = delivery.status === "SENT" ? "SENT" : "FAILED";
      error = delivery.status === "UNKNOWN" ? "Status kirim belum pasti; periksa WhatsApp sebelum mengirim ulang." : delivery.error;
    } catch (err) {
      if (err instanceof InsufficientCreditsError || err instanceof DailyMessagingQuotaError) { await pause(); break; }
      if (err instanceof DeliveryBlockedError) {
        if (!err.message.startsWith("Opt-out")) { await pause(); break; }
        error = err.message;
      } else throw err;
    }
    const data = { status, errorReason: error, sentAt: status === "SENT" ? new Date() : null };
    if (campaign) await prisma.campaignMessage.update({ where: { id: m.id }, data });
    else await prisma.blastMessage.update({ where: { id: m.id }, data });
    await new Promise((r) => setTimeout(r, process.env.NODE_ENV === "test" ? 0 : 3000 + Math.random() * 5000));
  }
  await prisma.$transaction(async (tx) => {
    const counts = campaign
      ? await tx.campaignMessage.groupBy({ by: ["status"], where: { campaignId: id }, _count: true })
      : await tx.blastMessage.groupBy({ by: ["status"], where: { blastId: id }, _count: true });
    const sentCount = counts.filter((x) => ["SENT", "DELIVERED", "READ"].includes(x.status)).reduce((n, x) => n + x._count, 0);
    const failedCount = counts.find((x) => x.status === "FAILED")?._count ?? 0;
    const pending = counts.find((x) => x.status === "PENDING")?._count ?? 0;
    const current = campaign ? await tx.campaign.findUnique({ where: { id } }) : await tx.blast.findUnique({ where: { id } });
    if (!current) return;
    const active = current.status === (campaign ? "ACTIVE" : "RUNNING");
    const done = active && pending === 0;
    if (campaign) await tx.campaign.update({ where: { id }, data: { sentCount, failedCount, ...(done ? { status: "COMPLETED", completedAt: new Date() } : {}) } });
    else await tx.blast.update({ where: { id }, data: { sentCount, failedCount, ...(done ? { status: "COMPLETED", completedAt: new Date() } : {}) } });
    if (active && pending) await enqueue(tx, kind, id, job.workspaceId);
  });
}

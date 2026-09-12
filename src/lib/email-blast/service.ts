import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/email/service";
import { renderMessage } from "@/lib/messaging/text";
import { addCreditsInTransaction, deductCreditsInTransaction, InsufficientCreditsError } from "@/lib/credits/service";
import { CREDIT_COSTS } from "@/config/plans";
import { enqueue } from "@/lib/jobs/queue";

export async function runEmailBlast(id: string) {
  const blast = await prisma.emailBlast.findUnique({ where: { id } });
  if (!blast || blast.status !== "RUNNING") return;
  const messages = await prisma.emailBlastMessage.findMany({ where: { emailBlastId: id, status: "PENDING" }, include: { contact: true }, orderBy: { createdAt: "asc" }, take: 10 });
  for (const m of messages) {
    if ((await prisma.emailBlast.findUnique({ where: { id } }))?.status !== "RUNNING") break;
    const key = `EMAIL_BLAST:${m.id}`;
    let receipt = await prisma.outboundDelivery.findUnique({ where: { id: key } });
    if (!receipt) {
      const dnc = await prisma.doNotContact.findUnique({ where: { workspaceId_phone: { workspaceId: blast.workspaceId, phone: m.contact.phone } } });
      if (!m.contact.email || dnc) {
        await prisma.emailBlastMessage.update({ where: { id: m.id }, data: { status: "FAILED", errorReason: dnc ? "Opt-out" : "Email tidak tersedia" } }); continue;
      }
      try {
        receipt = await prisma.$transaction(async (tx) => {
          await deductCreditsInTransaction(tx, blast.workspaceId, CREDIT_COSTS.sendEmail, "SEND_EMAIL");
          return tx.outboundDelivery.create({ data: { id: key, workspaceId: blast.workspaceId, contactId: m.contactId, channel: "EMAIL", cost: CREDIT_COSTS.sendEmail, status: "UNKNOWN", error: "Pengiriman terputus; periksa penyedia email sebelum mengirim ulang." } });
        });
      } catch (err) {
        if (err instanceof InsufficientCreditsError) { await prisma.emailBlast.update({ where: { id }, data: { status: "STOPPED" } }); break; }
        throw err;
      }
      const vars = { nama: m.contact.name, name: m.contact.name, kota: m.contact.city, phone: m.contact.phone };
      const body = renderMessage(blast.bodyText ?? "", vars).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)).replace(/\n/g, "<br>");
      const res = await sendEmail({ to: m.contact.email, subject: renderMessage(blast.subject, vars), html: body, idempotencyKey: key });
      receipt = await prisma.$transaction(async (tx) => {
        if (!res.ok && !res.uncertain) await addCreditsInTransaction(tx, blast.workspaceId, CREDIT_COSTS.sendEmail, "REFUND_SEND_EMAIL");
        return tx.outboundDelivery.update({ where: { id: key }, data: { status: res.ok ? "SENT" : res.uncertain ? "UNKNOWN" : "FAILED", error: res.error ?? null } });
      });
    }
    await prisma.emailBlastMessage.update({ where: { id: m.id }, data: { status: receipt.status === "SENT" ? "SENT" : "FAILED", sentAt: receipt.status === "SENT" ? new Date() : null, errorReason: receipt.error } });
  }
  await prisma.$transaction(async (tx) => {
    const counts = await tx.emailBlastMessage.groupBy({ by: ["status"], where: { emailBlastId: id }, _count: true });
    const pending = counts.find((c) => c.status === "PENDING")?._count ?? 0;
    const active = (await tx.emailBlast.findUnique({ where: { id } }))?.status === "RUNNING";
    await tx.emailBlast.update({ where: { id }, data: { sentCount: counts.filter((c) => ["SENT", "DELIVERED", "READ"].includes(c.status)).reduce((n, c) => n + c._count, 0), failedCount: counts.find((c) => c.status === "FAILED")?._count ?? 0, ...(active && !pending ? { status: "COMPLETED", completedAt: new Date() } : {}) } });
    if (active && pending) await enqueue(tx, "EMAIL_BLAST", id, blast.workspaceId);
  });
}

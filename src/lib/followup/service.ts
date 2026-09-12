import { prisma } from "@/lib/db/prisma";
import { renderMessage } from "@/lib/messaging/text";
import { deliverWhatsApp, DeliveryBlockedError } from "@/lib/messaging/delivery";
import { InsufficientCreditsError } from "@/lib/credits/service";
import { DailyMessagingQuotaError } from "@/lib/messaging/quota";

export function needsFollowUp(lastOutboundAt: Date | null, lastInboundAt: Date | null, days: number, now = new Date()) {
  return !!lastOutboundAt && lastOutboundAt.getTime() <= now.getTime() - days * 86_400_000 && (!lastInboundAt || lastInboundAt < lastOutboundAt);
}
export async function processFollowUps(workspaceId: string) {
  let generated = 0, sent = 0, failed = 0;
  const rules = await prisma.followUpRule.findMany({ where: { workspaceId, isActive: true, triggerType: "NO_REPLY_DAYS" } });
  for (const rule of rules) {
    const tv = rule.triggerValue as { days?: number; accountId?: string };
    const days = tv.days ?? 3;
    // Keyset pagination avoids starving contacts after the first page.
    let cursor: string | undefined;
    while (true) {
      const contacts = await prisma.contact.findMany({ where: { workspaceId, lastOutboundAt: { lte: new Date(Date.now() - days * 86_400_000) } }, orderBy: { id: "asc" }, take: 500, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) });
      for (const c of contacts) {
        if (!needsFollowUp(c.lastOutboundAt, c.lastInboundAt, days)) continue;
        const existing = await prisma.followUpSchedule.findFirst({ where: { ruleId: rule.id, contactId: c.id, OR: [{ outboundAt: c.lastOutboundAt }, { outboundAt: null, status: { in: ["SENT", "SCHEDULED"] } }] } });
        if (existing) continue;
        const created = await prisma.followUpSchedule.createMany({ data: [{ ruleId: rule.id, contactId: c.id, outboundAt: c.lastOutboundAt, scheduledAt: new Date() }], skipDuplicates: true });
        generated += created.count;
      }
      if (contacts.length < 500) break;
      cursor = contacts[contacts.length - 1].id;
    }
  }
  const due = await prisma.followUpSchedule.findMany({ where: { status: "SCHEDULED", scheduledAt: { lte: new Date() }, rule: { workspaceId, isActive: true } }, orderBy: { scheduledAt: "asc" }, take: 10 });
  for (const s of due) {
    const fresh = await prisma.followUpSchedule.findUnique({ where: { id: s.id }, include: { rule: true, contact: true } });
    if (!fresh || fresh.status !== "SCHEDULED" || !fresh.rule.isActive) continue;
    const tv = fresh.rule.triggerValue as { days?: number; accountId?: string };
    if (!needsFollowUp(fresh.contact.lastOutboundAt, fresh.contact.lastInboundAt, tv.days ?? 3) || (fresh.outboundAt && fresh.outboundAt.getTime() !== fresh.contact.lastOutboundAt?.getTime())) {
      await prisma.followUpSchedule.updateMany({ where: { id: s.id, status: "SCHEDULED" }, data: { status: "STOPPED_REPLIED" } }); continue;
    }
    if (!tv.accountId) { await prisma.followUpSchedule.update({ where: { id: s.id }, data: { status: "FAILED", errorReason: "Akun pengirim tidak diset" } }); failed++; continue; }
    try {
      const c = fresh.contact;
      const result = await deliverWhatsApp({ id: `FOLLOW_UP:${s.id}`, workspaceId, accountId: tv.accountId, contactId: c.id, followUp: true,
        text: renderMessage(fresh.rule.messageTemplate, { nama: c.name, name: c.name, kota: c.city, phone: c.phone }) });
      await prisma.followUpSchedule.update({ where: { id: s.id }, data: { status: result.status === "SENT" ? "SENT" : "FAILED", sentAt: result.status === "SENT" ? new Date() : null, errorReason: result.error } });
      if (result.status === "SENT") sent++; else failed++;
    } catch (err) {
      if (err instanceof InsufficientCreditsError) break;
      if (err instanceof DailyMessagingQuotaError || err instanceof DeliveryBlockedError) {
        if (err.message.startsWith("Opt-out")) await prisma.followUpSchedule.update({ where: { id: s.id }, data: { status: "CANCELLED" } });
        else await prisma.followUpSchedule.update({ where: { id: s.id }, data: { scheduledAt: new Date(Date.now() + 60_000), errorReason: err.message } });
        continue;
      }
      throw err;
    }
    await new Promise((r) => setTimeout(r, process.env.NODE_ENV === "test" ? 0 : 3000 + Math.random() * 5000));
  }
  return { generated, sent, failed };
}

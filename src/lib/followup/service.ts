import { prisma } from "@/lib/db/prisma";
import { getMessagingProvider } from "@/lib/messaging/provider";
import { renderMessage } from "@/lib/messaging/text";
import { getAccountDailyCounter } from "@/lib/messaging/account-limit";
import { getDailyMessagingQuota } from "@/lib/messaging/quota";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface TriggerValue {
  days?: number;
  accountId?: string;
}

/**
 * Proses follow-up untuk satu workspace:
 * 1) Hasilkan jadwal untuk aturan "X hari tanpa balasan".
 * 2) Kirim jadwal yang sudah jatuh tempo (hormati DNC, retry maks 2x).
 * Dipanggil manual atau oleh cron (Fase 7).
 */
export async function processFollowUps(workspaceId: string): Promise<{
  generated: number;
  sent: number;
  failed: number;
}> {
  let generated = 0;
  let sent = 0;
  let failed = 0;

  const rules = await prisma.followUpRule.findMany({
    where: { workspaceId, isActive: true, triggerType: "NO_REPLY_DAYS" },
  });

  // 1) Generate jadwal.
  for (const rule of rules) {
    const tv = (rule.triggerValue as TriggerValue) ?? {};
    const days = tv.days ?? 3;
    const cutoff = new Date(Date.now() - days * 86_400_000);

    const contacts = await prisma.contact.findMany({
      where: { workspaceId, OR: [{ lastContacted: { lt: cutoff } }, { lastContacted: null }] },
      select: { id: true, phone: true },
      take: 1000,
    });

    for (const c of contacts) {
      const dnc = await prisma.doNotContact.findUnique({
        where: { workspaceId_phone: { workspaceId, phone: c.phone } },
      });
      if (dnc) continue;

      const exists = await prisma.followUpSchedule.findFirst({
        where: { ruleId: rule.id, contactId: c.id, status: { in: ["SCHEDULED", "SENT"] } },
        select: { id: true },
      });
      if (exists) continue;

      await prisma.followUpSchedule.create({
        data: { ruleId: rule.id, contactId: c.id, scheduledAt: new Date() },
      });
      generated += 1;
    }
  }

  // 2) Kirim yang jatuh tempo.
  const provider = getMessagingProvider();
  const due = await prisma.followUpSchedule.findMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: new Date() }, rule: { workspaceId } },
    include: { rule: true, contact: true },
    take: 500,
  });

  for (const s of due) {
    const tv = (s.rule.triggerValue as TriggerValue) ?? {};
    const accountId = tv.accountId;
    if (!accountId) {
      await prisma.followUpSchedule.update({
        where: { id: s.id },
        data: { status: "FAILED", errorReason: "Akun pengirim tidak diset" },
      });
      failed += 1;
      continue;
    }

    const acc = await getAccountDailyCounter(accountId);
    if (!acc || acc.sentToday >= acc.dailyLimit) break;

    const quota = await getDailyMessagingQuota(workspaceId);
    if (quota.remaining <= 0) break;

    if ((await provider.getStatus(accountId)) !== "connected") {
      await prisma.followUpSchedule.update({
        where: { id: s.id },
        data: { status: "FAILED", errorReason: "Akun WhatsApp tidak terhubung" },
      });
      failed += 1;
      continue;
    }

    const dnc = await prisma.doNotContact.findUnique({
      where: { workspaceId_phone: { workspaceId, phone: s.contact.phone } },
    });
    if (dnc) {
      await prisma.followUpSchedule.update({ where: { id: s.id }, data: { status: "CANCELLED" } });
      continue;
    }

    const text = renderMessage(s.rule.messageTemplate, {
      nama: s.contact.name,
      name: s.contact.name,
      kota: s.contact.city,
      phone: s.contact.phone,
    });

    const res = await provider.sendMessage(accountId, s.contact.phone, { text });
    if (res.ok) {
      await prisma.followUpSchedule.update({
        where: { id: s.id },
        data: { status: "SENT", sentAt: new Date() },
      });
      await prisma.messagingAccount.update({
        where: { id: accountId },
        data: { sentToday: { increment: 1 } },
      });
      await prisma.contact.update({ where: { id: s.contactId }, data: { lastContacted: new Date() } });
      sent += 1;
    } else {
      const retry = s.retryCount + 1;
      await prisma.followUpSchedule.update({
        where: { id: s.id },
        data:
          retry >= 2
            ? { status: "FAILED", errorReason: res.error ?? "Gagal kirim", retryCount: retry }
            : { retryCount: retry },
      });
      failed += 1;
    }
    await delay(1000 + Math.random() * 2000);
  }

  return { generated, sent, failed };
}

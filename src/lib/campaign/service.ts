import { prisma } from "@/lib/db/prisma";
import { getMessagingProvider } from "@/lib/messaging/provider";
import { renderMessage } from "@/lib/messaging/text";
import { getAccountDailyCounter } from "@/lib/messaging/account-limit";
import { getDailyMessagingQuota } from "@/lib/messaging/quota";
import { isOnDnc } from "@/lib/contacts/dnc";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
function sendDelay() {
  return 3000 + Math.random() * 5000;
}
async function statusOf(id: string): Promise<string | undefined> {
  return (await prisma.campaign.findUnique({ where: { id }, select: { status: true } }))?.status;
}

/** Jalankan kampanye. Berhenti rapi saat status diubah jadi PAUSED (resume melanjutkan). */
export async function runCampaign(campaignId: string): Promise<void> {
  const c = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!c) return;
  if (!c.accountId) {
    await prisma.campaign.update({ where: { id: campaignId }, data: { status: "FAILED" } });
    return;
  }

  const provider = getMessagingProvider();
  if ((await provider.getStatus(c.accountId)) !== "connected") {
    await prisma.campaign.update({ where: { id: campaignId }, data: { status: "FAILED" } });
    return;
  }

  const messages = await prisma.campaignMessage.findMany({
    where: { campaignId, status: "PENDING" },
    include: { contact: true },
    orderBy: { createdAt: "asc" },
  });

  let sent = c.sentCount;
  let failed = c.failedCount;

  try {
    for (const m of messages) {
      if ((await statusOf(campaignId)) !== "ACTIVE") break; // dijeda/diberhentikan

      if (await isOnDnc(c.workspaceId, m.contact.phone)) {
        await prisma.campaignMessage.update({
          where: { id: m.id },
          data: { status: "FAILED", errorReason: "Opt-out (Do-Not-Contact)" },
        });
        failed += 1;
        await prisma.campaign.update({ where: { id: campaignId }, data: { failedCount: failed } });
        continue;
      }

      const acc = await getAccountDailyCounter(c.accountId);
      if (acc && acc.sentToday >= acc.dailyLimit) {
        await prisma.campaign.update({ where: { id: campaignId }, data: { status: "PAUSED" } });
        break;
      }

      const quota = await getDailyMessagingQuota(c.workspaceId);
      if (quota.remaining <= 0) {
        await prisma.campaign.update({ where: { id: campaignId }, data: { status: "PAUSED" } });
        break;
      }

      const text = renderMessage(c.messageTemplate, {
        nama: m.contact.name,
        name: m.contact.name,
        kota: m.contact.city,
        phone: m.contact.phone,
      });

      const res = await provider.sendMessage(c.accountId, m.contact.phone, { text });
      if (res.ok) {
        await prisma.campaignMessage.update({
          where: { id: m.id },
          data: { status: "SENT", sentAt: new Date() },
        });
        sent += 1;
        await prisma.messagingAccount.update({
          where: { id: c.accountId },
          data: { sentToday: { increment: 1 } },
        });
        await prisma.contact.update({ where: { id: m.contactId }, data: { lastContacted: new Date() } });
      } else {
        await prisma.campaignMessage.update({
          where: { id: m.id },
          data: { status: "FAILED", errorReason: res.error ?? "Gagal kirim" },
        });
        failed += 1;
      }

      await prisma.campaign.update({
        where: { id: campaignId },
        data: { sentCount: sent, failedCount: failed },
      });
      await delay(sendDelay());
    }

    if ((await statusOf(campaignId)) === "ACTIVE") {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "COMPLETED", completedAt: new Date(), sentCount: sent, failedCount: failed },
      });
    }
  } catch {
    await prisma.campaign
      .update({ where: { id: campaignId }, data: { status: "FAILED", sentCount: sent, failedCount: failed } })
      .catch(() => undefined);
  }
}

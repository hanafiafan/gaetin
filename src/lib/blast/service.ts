import { prisma } from "@/lib/db/prisma";
import { getMessagingProvider } from "@/lib/messaging/provider";
import { renderMessage } from "@/lib/messaging/text";
import { getAccountDailyCounter } from "@/lib/messaging/account-limit";
import { getDailyMessagingQuota } from "@/lib/messaging/quota";
import { isOnDnc } from "@/lib/contacts/dnc";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
// Jeda acak 3-8 detik antar pesan (Req 2.4, anti-ban).
function sendDelay() {
  return 3000 + Math.random() * 5000;
}

async function blastStopped(blastId: string): Promise<boolean> {
  const b = await prisma.blast.findUnique({ where: { id: blastId }, select: { status: true } });
  return b?.status === "STOPPED";
}

export async function runBlast(blastId: string): Promise<void> {
  const blast = await prisma.blast.findUnique({ where: { id: blastId } });
  if (!blast) return;

  const vars = (blast.variables as { accountId?: string } | null) ?? null;
  const accountId = vars?.accountId;
  if (!accountId) {
    await prisma.blast.update({ where: { id: blastId }, data: { status: "FAILED" } });
    return;
  }

  const provider = getMessagingProvider();
  if ((await provider.getStatus(accountId)) !== "connected") {
    await prisma.blast.update({ where: { id: blastId }, data: { status: "FAILED" } });
    return;
  }

  const messages = await prisma.blastMessage.findMany({
    where: { blastId, status: "PENDING" },
    include: { contact: true },
  });

  let sentCount = blast.sentCount;
  let failedCount = blast.failedCount;

  try {
    for (const m of messages) {
      if (await blastStopped(blastId)) break;

      // Hormati Do-Not-Contact / opt-out.
      if (await isOnDnc(blast.workspaceId, m.contact.phone)) {
        await prisma.blastMessage.update({
          where: { id: m.id },
          data: { status: "FAILED", errorReason: "Opt-out (Do-Not-Contact)" },
        });
        failedCount += 1;
        await prisma.blast.update({ where: { id: blastId }, data: { failedCount } });
        continue;
      }

      // Batas harian per nomor (anti-ban).
      const acc = await getAccountDailyCounter(accountId);
      if (acc && acc.sentToday >= acc.dailyLimit) {
        await prisma.blast.update({ where: { id: blastId }, data: { status: "STOPPED" } });
        break;
      }

      const quota = await getDailyMessagingQuota(blast.workspaceId);
      if (quota.remaining <= 0) {
        await prisma.blast.update({ where: { id: blastId }, data: { status: "STOPPED" } });
        break;
      }

      const text = renderMessage(blast.messageText ?? "", {
        nama: m.contact.name,
        name: m.contact.name,
        kota: m.contact.city,
        phone: m.contact.phone,
      });

      const res = await provider.sendMessage(accountId, m.contact.phone, { text });
      if (res.ok) {
        await prisma.blastMessage.update({
          where: { id: m.id },
          data: { status: "SENT", sentAt: new Date() },
        });
        sentCount += 1;
        await prisma.messagingAccount.update({
          where: { id: accountId },
          data: { sentToday: { increment: 1 } },
        });
        await prisma.contact.update({
          where: { id: m.contactId },
          data: { lastContacted: new Date() },
        });
      } else {
        await prisma.blastMessage.update({
          where: { id: m.id },
          data: { status: "FAILED", errorReason: res.error ?? "Gagal kirim" },
        });
        failedCount += 1;
      }

      await prisma.blast.update({ where: { id: blastId }, data: { sentCount, failedCount } });
      await delay(sendDelay());
    }

    const stopped = await blastStopped(blastId);
    await prisma.blast.update({
      where: { id: blastId },
      data: {
        status: stopped ? "STOPPED" : "COMPLETED",
        completedAt: new Date(),
        sentCount,
        failedCount,
      },
    });
  } catch {
    await prisma.blast
      .update({ where: { id: blastId }, data: { status: "FAILED", sentCount, failedCount } })
      .catch(() => undefined);
  }
}

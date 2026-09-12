import { prisma } from "@/lib/db/prisma";
import { dayStart } from "@/lib/messaging/quota";

export async function getAccountDailyCounter(accountId: string) {
  const account = await prisma.messagingAccount.findUnique({
    where: { id: accountId },
    select: { id: true, dailyLimit: true, sentToday: true, sentTodayResetAt: true },
  });
  if (!account) return null;

  const today = dayStart();
  if (!account.sentTodayResetAt || account.sentTodayResetAt < today) {
    await prisma.messagingAccount.updateMany({
      where: { id: accountId, OR: [{ sentTodayResetAt: null }, { sentTodayResetAt: { lt: today } }] },
      data: { sentToday: 0, sentTodayResetAt: today },
    });
    return prisma.messagingAccount.findUnique({ where: { id: accountId }, select: { id: true, dailyLimit: true, sentToday: true, sentTodayResetAt: true } });
  }

  return account;
}

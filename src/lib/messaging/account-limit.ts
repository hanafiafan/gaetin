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
    return prisma.messagingAccount.update({
      where: { id: accountId },
      data: { sentToday: 0, sentTodayResetAt: new Date() },
      select: { id: true, dailyLimit: true, sentToday: true, sentTodayResetAt: true },
    });
  }

  return account;
}

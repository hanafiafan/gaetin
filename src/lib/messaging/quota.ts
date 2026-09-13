import { prisma } from "@/lib/db/prisma";
import { getWorkspacePlan } from "@/lib/plans/limits";
import { totalSisaJatah } from "@/lib/messaging/rotation";
import { effectiveDailyLimit } from "@/lib/messaging/warmup";

export class DailyMessagingQuotaError extends Error {
  constructor(public limit: number) {
    super(`Kuota pengiriman hari ini sudah habis (${limit} pesan).`);
    this.name = "DailyMessagingQuotaError";
  }
}

// Billing day is Asia/Jakarta (UTC+7), independent of the app/worker host timezone.
export function dayStart(date = new Date()): Date {
  const day = 86_400_000, offset = 7 * 3_600_000;
  return new Date(Math.floor((date.getTime() + offset) / day) * day - offset);
}
export function nextDayStart(date = new Date()): Date {
  return new Date(dayStart(date).getTime() + 86_400_000);
}

export async function getDailyMessagingUsage(workspaceId: string, date = new Date()): Promise<number> {
  const start = dayStart(date);
  return prisma.outboundDelivery.count({ where: {
    workspaceId, channel: "WHATSAPP", status: { not: "FAILED" }, createdAt: { gte: start },
  } });
}

export async function getDailyMessagingQuota(workspaceId: string) {
  const plan = await getWorkspacePlan(workspaceId);
  const limit = plan.limits.campaignDailyLimit;
  const used = await getDailyMessagingUsage(workspaceId);

  // Jatah paket bukan jatah yang benar-benar bisa dipakai. Satu nomor WhatsApp
  // punya batas amannya sendiri, jadi kemampuan nyata sebuah workspace adalah
  // yang LEBIH KECIL antara jatah paket dan jumlah batas semua nomornya.
  // Menampilkan "1.000 sisa" kepada orang yang hanya punya satu nomor berbatas
  // 100 bukan angka yang optimistis — itu angka yang salah.
  const nomor = await prisma.messagingAccount.findMany({
    where: { workspaceId, status: "CONNECTED" },
    select: { dailyLimit: true, warmupDay: true },
  });
  const kapasitasNomor = nomor.reduce((jumlah, a) => jumlah + effectiveDailyLimit(a), 0);
  const sisaNomor = await totalSisaJatah(workspaceId);

  const efektif = Math.min(limit, kapasitasNomor);
  const sisaPaket = Math.max(0, limit - used);

  return {
    planName: plan.name,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    resetAt: nextDayStart().toISOString(),
    /** Nomor tersambung dan kemampuan gabungannya hari ini. */
    connectedNumbers: nomor.length,
    numberCapacity: kapasitasNomor,
    /** Yang benar-benar bisa dikirim hari ini, dan apa yang membatasinya. */
    effectiveLimit: efektif,
    effectiveRemaining: Math.min(sisaPaket, sisaNomor),
    bottleneck: (kapasitasNomor < limit ? "numbers" : "plan") as "numbers" | "plan",
  };
}

export async function assertDailyMessagingQuota(workspaceId: string): Promise<void> {
  const quota = await getDailyMessagingQuota(workspaceId);
  if (quota.remaining <= 0) throw new DailyMessagingQuotaError(quota.limit);
}

import { prisma } from "@/lib/db/prisma";
import { PLANS, type PlanId } from "@/config/plans";

export class QuotaExceededError extends Error {
  constructor(public limit: number) {
    super(`Kuota kontak tercapai (${limit}). Upgrade paket untuk menambah kapasitas.`);
    this.name = "QuotaExceededError";
  }
}

/** Pastikan workspace masih boleh menambah `add` kontak sesuai kuota plan-nya. */
export async function assertCanAddContacts(workspaceId: string, add = 1): Promise<void> {
  const subscription = await prisma.subscription.findUnique({ where: { workspaceId } });
  const planId = (subscription?.plan ?? "GROWTH") as PlanId;
  const quota = PLANS[planId].contactQuota; // null = unlimited
  if (quota === null) return;

  const current = await prisma.contact.count({ where: { workspaceId } });
  if (current + add > quota) {
    throw new QuotaExceededError(quota);
  }
}

import { prisma } from "@/lib/db/prisma";

export class InsufficientCreditsError extends Error {
  constructor() {
    super("Kredit tidak cukup. Lakukan top-up atau upgrade paket.");
    this.name = "InsufficientCreditsError";
  }
}

export async function getBalance(workspaceId: string): Promise<number> {
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { credits: true },
  });
  return ws?.credits ?? 0;
}

/** Tambah kredit (top-up / alokasi paket / trial) + catat ledger. */
export async function addCredits(
  workspaceId: string,
  amount: number,
  reason: string,
): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const ws = await tx.workspace.update({
      where: { id: workspaceId },
      data: { credits: { increment: amount } },
      select: { credits: true },
    });
    await tx.creditLedger.create({
      data: { workspaceId, amount, reason, balanceAfter: ws.credits },
    });
    return ws.credits;
  });
}

/** Potong kredit; lempar InsufficientCreditsError bila saldo kurang. */
export async function deductCredits(
  workspaceId: string,
  amount: number,
  reason: string,
): Promise<number> {
  if (amount <= 0) return getBalance(workspaceId);
  return prisma.$transaction(async (tx) => {
    const ws = await tx.workspace.findUnique({
      where: { id: workspaceId },
      select: { credits: true },
    });
    if (!ws || ws.credits < amount) throw new InsufficientCreditsError();
    const upd = await tx.workspace.update({
      where: { id: workspaceId },
      data: { credits: { decrement: amount } },
      select: { credits: true },
    });
    await tx.creditLedger.create({
      data: { workspaceId, amount: -amount, reason, balanceAfter: upd.credits },
    });
    return upd.credits;
  });
}

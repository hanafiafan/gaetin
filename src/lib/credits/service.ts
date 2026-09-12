import type { Prisma } from "@prisma/client";
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
  return prisma.$transaction((tx) => addCreditsInTransaction(tx, workspaceId, amount, reason));
}

export async function addCreditsInTransaction(tx: Prisma.TransactionClient, workspaceId: string, amount: number, reason: string): Promise<number> {
    if (!Number.isSafeInteger(amount) || amount < 0) throw new Error("INVALID_CREDIT_AMOUNT");
    const ws = await tx.workspace.update({
      where: { id: workspaceId },
      data: { credits: { increment: amount } },
      select: { credits: true },
    });
    await tx.creditLedger.create({
      data: { workspaceId, amount, reason, balanceAfter: ws.credits },
    });
    return ws.credits;
}

/** Potong kredit; lempar InsufficientCreditsError bila saldo kurang. */
export async function deductCredits(
  workspaceId: string,
  amount: number,
  reason: string,
): Promise<number> {
  return prisma.$transaction((tx) => deductCreditsInTransaction(tx, workspaceId, amount, reason));
}

export async function deductCreditsInTransaction(tx: Prisma.TransactionClient, workspaceId: string, amount: number, reason: string): Promise<number> {
    if (!Number.isSafeInteger(amount) || amount < 0) throw new Error("INVALID_CREDIT_AMOUNT");
    // Cek saldo dan pemotongan harus satu pernyataan. Sebagai baca-lalu-tulis di
    // READ COMMITTED, dua request bersamaan sama-sama membaca saldo lama, sama-sama
    // lolos cek, lalu sama-sama memotong — saldo bisa jatuh di bawah nol.
    const rows = await tx.$queryRaw<{ credits: number }[]>`
      UPDATE "Workspace" SET credits = credits - ${amount}
      WHERE id = ${workspaceId} AND credits >= ${amount}
      RETURNING credits`;
    if (rows.length === 0) throw new InsufficientCreditsError();

    const balance = rows[0].credits;
    await tx.creditLedger.create({
      data: { workspaceId, amount: -amount, reason, balanceAfter: balance },
    });
    return balance;
}

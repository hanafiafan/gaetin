import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { deductCredits, InsufficientCreditsError } from "@/lib/credits/service";

// Integration runs require an explicit isolated TEST_DATABASE_URL and fail if unavailable.
const prisma = new PrismaClient();
beforeAll(async () => { await prisma.$queryRaw`SELECT 1`; });

afterAll(async () => {
  await prisma.$disconnect();
});

async function withWorkspace(credits: number, fn: (id: string) => Promise<void>) {
  const ws = await prisma.workspace.create({
    data: { name: "credits-test", slug: `credits-test-${Date.now()}-${Math.random()}`, credits },
  });
  try {
    await fn(ws.id);
  } finally {
    await prisma.creditLedger.deleteMany({ where: { workspaceId: ws.id } });
    await prisma.workspace.delete({ where: { id: ws.id } });
  }
}

describe("deductCredits", () => {
  it("menolak pemotongan melebihi saldo tanpa mengubah saldo", async () => {
    await withWorkspace(3, async (id) => {
      await expect(deductCredits(id, 4, "TEST")).rejects.toBeInstanceOf(InsufficientCreditsError);
      const after = await prisma.workspace.findUniqueOrThrow({
        where: { id },
        select: { credits: true },
      });
      expect(after.credits).toBe(3);
    });
  });

  it("memotong tepat sampai nol, lalu menolak", async () => {
    await withWorkspace(2, async (id) => {
      expect(await deductCredits(id, 1, "TEST")).toBe(1);
      expect(await deductCredits(id, 1, "TEST")).toBe(0);
      await expect(deductCredits(id, 1, "TEST")).rejects.toBeInstanceOf(InsufficientCreditsError);
    });
  });

  // Catatan: ini smoke test, bukan detektor race yang andal. Pool koneksi Prisma
  // cenderung menyerialkan transaksi di DB lokal yang cepat, sehingga implementasi
  // baca-lalu-tulis pun bisa lolos di sini. Race sesungguhnya hanya muncul dengan
  // koneksi terpisah dan jeda di antara baca dan tulis — bila mengubah
  // deductCredits, verifikasi manual dengan cara itu.
  it("tidak pernah membiarkan saldo jatuh di bawah nol", async () => {
    await withWorkspace(5, async (id) => {
      await Promise.allSettled(Array.from({ length: 20 }, () => deductCredits(id, 1, "TEST")));
      const after = await prisma.workspace.findUniqueOrThrow({
        where: { id },
        select: { credits: true },
      });
      expect(after.credits).toBeGreaterThanOrEqual(0);
    });
  });
});

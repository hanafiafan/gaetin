import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { runBlast } from "@/lib/blast/service";
import { DailyMessagingQuotaError, assertDailyMessagingQuota } from "@/lib/messaging/quota";
import { fail } from "@/lib/api";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const blast = await prisma.blast.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    select: { id: true, status: true },
  });
  if (!blast) return fail("NOT_FOUND", "Blast tidak ditemukan", 404);
  if (blast.status === "RUNNING") return fail("BLAST_002", "Blast sedang berjalan", 409);

  try {
    await assertDailyMessagingQuota(session.workspace.id);
  } catch (e) {
    if (e instanceof DailyMessagingQuotaError) return fail("PLAN_LIMIT", e.message, 403);
    throw e;
  }

  await prisma.blast.update({
    where: { id: blast.id },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  // Jalankan di latar belakang (di produksi: worker BullMQ).
  void runBlast(blast.id).catch(() => undefined);

  return NextResponse.json({ success: true, data: { status: "RUNNING" } }, { status: 202 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const job = await prisma.scraperJob.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    select: { id: true, status: true },
  });
  if (!job) return fail("NOT_FOUND", "Job tidak ditemukan", 404);

  if (job.status === "RUNNING") {
    await prisma.scraperJob.update({ where: { id: job.id }, data: { status: "STOPPED" } });
  }
  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const blast = await prisma.blast.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    select: { id: true, status: true },
  });
  if (!blast) return fail("NOT_FOUND", "Blast tidak ditemukan", 404);

  if (blast.status === "RUNNING") {
    await prisma.blast.update({ where: { id: blast.id }, data: { status: "STOPPED" } });
  }
  return NextResponse.json({ success: true });
}

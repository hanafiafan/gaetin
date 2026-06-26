import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const c = await prisma.campaign.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    select: { id: true, status: true },
  });
  if (!c) return fail("NOT_FOUND", "Kampanye tidak ditemukan", 404);

  if (c.status === "ACTIVE") {
    await prisma.campaign.update({ where: { id: c.id }, data: { status: "PAUSED" } });
  }
  return NextResponse.json({ success: true });
}

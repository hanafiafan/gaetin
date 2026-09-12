import { featureDenied } from "@/lib/auth/entitlements";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function POST(_req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "blast");
  if (denied) return denied;

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

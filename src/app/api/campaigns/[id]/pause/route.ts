import { featureDenied } from "@/lib/auth/entitlements";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function POST(_req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "campaigns");
  if (denied) return denied;

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

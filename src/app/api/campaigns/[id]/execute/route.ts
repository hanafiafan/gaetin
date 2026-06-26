import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { runCampaign } from "@/lib/campaign/service";
import { DailyMessagingQuotaError, assertDailyMessagingQuota } from "@/lib/messaging/quota";
import { fail } from "@/lib/api";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const c = await prisma.campaign.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    select: { id: true, status: true },
  });
  if (!c) return fail("NOT_FOUND", "Kampanye tidak ditemukan", 404);
  if (c.status === "ACTIVE") return fail("CAMP_002", "Kampanye sedang berjalan", 409);

  try {
    await assertDailyMessagingQuota(session.workspace.id);
  } catch (e) {
    if (e instanceof DailyMessagingQuotaError) return fail("PLAN_LIMIT", e.message, 403);
    throw e;
  }

  await prisma.campaign.update({
    where: { id: c.id },
    data: { status: "ACTIVE", startedAt: new Date() },
  });
  void runCampaign(c.id).catch(() => undefined);

  return NextResponse.json({ success: true, data: { status: "ACTIVE" } }, { status: 202 });
}

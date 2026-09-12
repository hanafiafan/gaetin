import { featureDenied } from "@/lib/auth/entitlements";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { enqueue } from "@/lib/jobs/queue";
import { prisma } from "@/lib/db/prisma";
import { DailyMessagingQuotaError, assertDailyMessagingQuota } from "@/lib/messaging/quota";
import { fail } from "@/lib/api";

export async function POST() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "autoFollowUp");
  if (denied) return denied;

  try {
    await assertDailyMessagingQuota(session.workspace.id);
  } catch (e) {
    if (e instanceof DailyMessagingQuotaError) return fail("PLAN_LIMIT", e.message, 403);
    throw e;
  }

  await prisma.$transaction((tx) => enqueue(tx, "FOLLOW_UP", session.workspace.id, session.workspace.id));
  return NextResponse.json({ success: true, data: { queued: true } }, { status: 202 });
}

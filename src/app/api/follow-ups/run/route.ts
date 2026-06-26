import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { processFollowUps } from "@/lib/followup/service";
import { DailyMessagingQuotaError, assertDailyMessagingQuota } from "@/lib/messaging/quota";
import { fail } from "@/lib/api";

export async function POST() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  try {
    await assertDailyMessagingQuota(session.workspace.id);
  } catch (e) {
    if (e instanceof DailyMessagingQuotaError) return fail("PLAN_LIMIT", e.message, 403);
    throw e;
  }

  const result = await processFollowUps(session.workspace.id);
  return NextResponse.json({ success: true, data: result });
}

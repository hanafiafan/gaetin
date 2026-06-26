import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDailyMessagingQuota } from "@/lib/messaging/quota";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const quota = await getDailyMessagingQuota(session.workspace.id);
  return NextResponse.json({ success: true, data: quota });
}

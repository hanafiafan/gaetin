import { featureDenied } from "@/lib/auth/entitlements";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { startSendJob } from "@/lib/jobs/queue";
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
  if (c.status !== "PAUSED") return fail("CAMP_003", "Kampanye tidak sedang dijeda", 409);

  const started = await startSendJob("CAMPAIGN", c.id, session.workspace.id, true);
  if (!started) return fail("JOB_CONFLICT", "Status pekerjaan berubah atau tidak dapat dijalankan", 409);

  return NextResponse.json({ success: true, data: { status: "ACTIVE" } }, { status: 202 });
}

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
  const denied = await featureDenied(session.workspace.id, "emailBlast");
  if (denied) return denied;

  const blast = await prisma.emailBlast.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    select: { id: true, status: true },
  });
  if (!blast) return fail("NOT_FOUND", "Email blast tidak ditemukan", 404);
  if (blast.status === "RUNNING") return fail("BLAST_002", "Email blast sedang berjalan", 409);

  const started = await startSendJob("EMAIL_BLAST", blast.id, session.workspace.id, false);
  if (!started) return fail("JOB_CONFLICT", "Status pekerjaan berubah atau tidak dapat dijalankan", 409);

  return NextResponse.json({ success: true, data: { status: "RUNNING" } }, { status: 202 });
}

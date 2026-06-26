import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const [sub, ws] = await Promise.all([
    prisma.subscription.findUnique({ where: { workspaceId: session.workspace.id } }),
    prisma.workspace.findUnique({ where: { id: session.workspace.id }, select: { credits: true } }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      plan: sub?.plan ?? "STARTER",
      status: sub?.status ?? "TRIAL",
      billingCycle: sub?.billingCycle ?? null,
      currentPeriodEnd: sub?.currentPeriodEnd ?? null,
      trialEndsAt: sub?.trialEndsAt ?? null,
      credits: ws?.credits ?? 0,
    },
  });
}

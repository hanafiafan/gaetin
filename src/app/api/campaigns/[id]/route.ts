import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const c = await prisma.campaign.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    select: {
      id: true,
      name: true,
      status: true,
      totalRecipients: true,
      sentCount: true,
      failedCount: true,
      scheduledAt: true,
    },
  });
  if (!c) return fail("NOT_FOUND", "Kampanye tidak ditemukan", 404);

  const deliveryRate = c.totalRecipients > 0 ? Math.round((c.sentCount / c.totalRecipients) * 100) : 0;
  return NextResponse.json({ success: true, data: { ...c, deliveryRate } });
}

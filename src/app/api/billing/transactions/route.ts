import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const rows = await prisma.transaction.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      kind: true,
      plan: true,
      billingCycle: true,
      credits: true,
      grossAmount: true,
      status: true,
      invoiceUrl: true,
      createdAt: true,
    },
  });

  const data = rows.map((t) => ({ ...t, grossAmount: Number(t.grossAmount) }));
  return NextResponse.json({ success: true, data });
}

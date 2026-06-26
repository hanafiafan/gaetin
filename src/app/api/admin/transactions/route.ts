import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSuperAdminSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);

  const rows = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { workspace: { select: { name: true } } },
  });
  const data = rows.map((t) => ({
    id: t.id,
    workspace: t.workspace.name,
    kind: t.kind,
    plan: t.plan,
    credits: t.credits,
    grossAmount: Number(t.grossAmount),
    status: t.status,
    createdAt: t.createdAt,
  }));
  return NextResponse.json({ success: true, data });
}

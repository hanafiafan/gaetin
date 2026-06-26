import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSuperAdminSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);

  const rows = await prisma.workspace.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      subscription: { select: { plan: true, status: true } },
      memberships: { where: { role: "OWNER" }, include: { user: { select: { email: true } } }, take: 1 },
      _count: { select: { contacts: true } },
    },
  });

  const data = rows.map((w) => ({
    id: w.id,
    name: w.name,
    owner: w.memberships[0]?.user.email ?? "—",
    plan: w.subscription?.plan ?? "STARTER",
    status: w.subscription?.status ?? "TRIAL",
    credits: w.credits,
    contacts: w._count.contacts,
    createdAt: w.createdAt,
  }));
  return NextResponse.json({ success: true, data });
}

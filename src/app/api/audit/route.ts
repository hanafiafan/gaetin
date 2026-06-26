import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const logs = await prisma.auditLog.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const userIds = [...new Set(logs.map((l) => l.userId).filter((x): x is string => !!x))];
  const users = userIds.length
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
    : [];
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  const data = logs.map((l) => ({
    id: l.id,
    action: l.action,
    target: l.target,
    actor: l.userId ? nameById.get(l.userId) ?? "—" : "Sistem",
    createdAt: l.createdAt,
  }));
  return NextResponse.json({ success: true, data });
}

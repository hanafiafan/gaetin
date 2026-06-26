import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSuperAdminSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET(req: NextRequest) {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);

  const q = req.nextUrl.searchParams.get("query")?.trim() ?? "";
  const rows = await prisma.user.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, name: true, email: true, isSuperAdmin: true, lockedUntil: true, createdAt: true },
  });

  const now = Date.now();
  const data = rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    isSuperAdmin: u.isSuperAdmin,
    locked: !!(u.lockedUntil && u.lockedUntil.getTime() > now),
    createdAt: u.createdAt,
  }));
  return NextResponse.json({ success: true, data });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSuperAdminSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET(req: NextRequest) {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);

  const sp = req.nextUrl.searchParams;
  const workspaceId = sp.get("workspaceId") || undefined;
  const search = sp.get("search")?.trim() || undefined;
  const hasPhone = sp.get("hasPhone") === "true";
  const limit = Math.min(Number(sp.get("limit") || 200), 500);
  const offset = Number(sp.get("offset") || 0);

  const where: Record<string, unknown> = {};
  if (workspaceId) where.workspaceId = workspaceId;
  if (hasPhone) where.phone = { not: null };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: { workspace: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.contact.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: { items, total } });
}

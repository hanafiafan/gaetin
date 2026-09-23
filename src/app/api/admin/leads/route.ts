import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSuperAdminSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";
import { parseIntegerParam } from "@/lib/http/query";

export async function GET(req: NextRequest) {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);

  const sp = req.nextUrl.searchParams;
  const workspaceId = sp.get("workspaceId") || undefined;
  const search = sp.get("search")?.trim() || undefined;
  const hasPhone = sp.get("hasPhone") === "true";
  const limit = parseIntegerParam(sp.get("limit"), { min: 1, max: 500, fallback: 200 });
  const offset = parseIntegerParam(sp.get("offset"), { min: 0, max: 1_000_000, fallback: 0 });

  const where: Record<string, unknown> = {};
  if (workspaceId) where.workspaceId = workspaceId;
  if (hasPhone) where.phone = { not: null };
  if (search) {
    where.OR = [
      { businessName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { category: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { workspace: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: { items, total } });
}

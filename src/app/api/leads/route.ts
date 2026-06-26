import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const sp = req.nextUrl.searchParams;
  const scraperJobId = sp.get("scraperJobId") ?? undefined;
  const saved = sp.get("saved"); // "true" | "false" | null(all)
  const query = sp.get("query")?.trim() ?? "";
  const category = sp.get("category")?.trim() ?? "";
  const hasPhone = sp.get("hasPhone") === "true";
  const minRating = Number(sp.get("minRating") ?? "0");
  const page = Math.max(1, Number(sp.get("page") ?? "1"));
  const pageSize = Math.min(200, Math.max(1, Number(sp.get("pageSize") ?? "50")));

  const where: Prisma.LeadWhereInput = { workspaceId: session.workspace.id };
  if (scraperJobId) where.scraperJobId = scraperJobId;
  if (saved === "true") where.saved = true;
  if (saved === "false") where.saved = false;
  if (category) where.category = { contains: category, mode: "insensitive" };
  if (hasPhone) where.phone = { not: null };
  if (Number.isFinite(minRating) && minRating > 0) where.rating = { gte: minRating };
  if (query) {
    where.OR = [
      { businessName: { contains: query, mode: "insensitive" } },
      { phone: { contains: query } },
      { category: { contains: query, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: { items, total, page, pageSize } });
}

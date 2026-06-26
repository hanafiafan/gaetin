import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

function csvCell(value: unknown): string {
  if (value == null) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const sp = req.nextUrl.searchParams;
  const scraperJobId = sp.get("scraperJobId") ?? undefined;
  const saved = sp.get("saved");
  const query = sp.get("query")?.trim() ?? "";
  const category = sp.get("category")?.trim() ?? "";
  const hasPhone = sp.get("hasPhone") === "true";
  const minRating = Number(sp.get("minRating") ?? "0");

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

  const leads = await prisma.lead.findMany({
    where,
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }, { createdAt: "desc" }],
    take: 5_000,
  });

  const header = [
    "businessName",
    "phone",
    "email",
    "website",
    "address",
    "city",
    "category",
    "rating",
    "reviewCount",
    "latitude",
    "longitude",
    "saved",
    "createdAt",
  ];
  const rows = leads.map((lead) =>
    [
      lead.businessName,
      lead.phone,
      lead.email,
      lead.website,
      lead.address,
      lead.city,
      lead.category,
      lead.rating,
      lead.reviewCount,
      lead.latitude,
      lead.longitude,
      lead.saved ? "yes" : "no",
      lead.createdAt.toISOString(),
    ].map(csvCell).join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gaetin-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

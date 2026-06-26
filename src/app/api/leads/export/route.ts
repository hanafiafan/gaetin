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

  const format = sp.get("format") || "csv";
  const jobName = sp.get("jobName")?.trim() ?? "";
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "-");
  const safeName = jobName
    ? jobName.replace(/[^a-zA-Z0-9\s\-_]/g, "").trim().replace(/\s+/g, "-").slice(0, 60)
    : "gaetin-leads";
  const fileBase = `${safeName}_${dateStr}_${timeStr}`;

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
    "mapsUrl",
    "plusCode",
    "priceRange",
    "openingHours",
    "serviceOptions",
    "amenities",
    "description",
    "topReviews",
    "photos",
    "saved",
    "createdAt",
  ];

  const rawRows = leads.map((lead) => [
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
    lead.mapsUrl,
    lead.plusCode,
    lead.priceRange,
    lead.openingHours ? JSON.stringify(lead.openingHours) : null,
    lead.serviceOptions ? JSON.stringify(lead.serviceOptions) : null,
    lead.amenities ? JSON.stringify(lead.amenities) : null,
    lead.description,
    lead.topReviews ? JSON.stringify(lead.topReviews) : null,
    lead.photos ? JSON.stringify(lead.photos) : null,
    lead.saved ? "yes" : "no",
    lead.createdAt.toISOString(),
  ]);

  if (format === "xlsx") {
    const xlsx = await import("xlsx");
    const ws = xlsx.utils.aoa_to_sheet([header, ...rawRows]);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Leads");
    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileBase}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const rows = rawRows.map((r) => r.map(csvCell).join(","));
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileBase}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { isManager } from "@/lib/auth/roles";

/**
 * Nama bisnis berasal dari listing Google Maps, yang bisa disetel orang lain.
 * Excel/Sheets mengeksekusi sel yang diawali = + - @ sebagai formula, jadi
 * listing bernama "=cmd|..." berubah jadi serangan saat file dibuka. Berlaku
 * untuk CSV maupun xlsx.
 */
function guardFormula(value: unknown): unknown {
  if (typeof value !== "string") return value;
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function csvCell(value: unknown): string {
  const guarded = guardFormula(value);
  if (guarded == null) return "";
  const text = String(guarded);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  // Route ini hanya dibuka lewat navigasi <a href>, jadi respons JSON akan tampil sebagai halaman mentah.
  if (!session) return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  // Ekspor menarik seluruh database lead dalam satu file — itu aset inti
  // workspace, bukan sesuatu yang boleh dibawa keluar oleh anggota biasa.
  if (!isManager(session)) {
    return NextResponse.redirect(new URL("/dashboard?error=export_forbidden", req.url), { status: 303 });
  }

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
    : "hellens-leads";
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
    const ws = xlsx.utils.aoa_to_sheet([header, ...rawRows.map((r) => r.map(guardFormula))]);
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

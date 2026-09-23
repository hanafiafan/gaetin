import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { isManager } from "@/lib/auth/roles";

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
  if (!session) return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  
  if (!isManager(session)) {
    return NextResponse.redirect(new URL("/dashboard?error=export_forbidden", req.url), { status: 303 });
  }

  const sp = req.nextUrl.searchParams;
  const query = sp.get("query")?.trim() ?? "";
  const waStatus = sp.get("waStatus") as any;
  const hasEmail = sp.get("hasEmail") === "true";

  const where: Prisma.ContactWhereInput = { workspaceId: session.workspace.id };
  if (waStatus) where.waStatus = waStatus;
  if (hasEmail) where.email = { not: null };
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { phone: { contains: query } },
      { category: { contains: query, mode: "insensitive" } },
    ];
  }

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10_000,
  });

  const format = sp.get("format") || "xlsx";
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "-");
  const safeName = "hellens-contacts";
  const fileBase = `${safeName}_${dateStr}_${timeStr}`;

  const header = [
    "name",
    "phone",
    "label",
    "waStatus",
    "source",
    "email",
    "website",
    "address",
    "city",
    "category",
    "latitude",
    "longitude",
    "crmStage",
    "score",
  ];

  const rawRows = contacts.map((contact) => [
    contact.name,
    contact.phone,
    contact.label,
    contact.waStatus,
    contact.source,
    contact.email,
    contact.website,
    contact.address,
    contact.city,
    contact.category,
    contact.latitude,
    contact.longitude,
    contact.crmStage,
    contact.score,
  ]);

  if (format === "xlsx") {
    const xlsx = await import("xlsx");
    const ws = xlsx.utils.aoa_to_sheet([header, ...rawRows.map((r) => r.map(guardFormula))]);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Contacts");
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

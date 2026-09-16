import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

/**
 * Label yang benar-benar dipakai di workspace ini.
 *
 * Kolom "Filter label" dulu berupa kotak teks kosong: tidak ada cara mengetahui
 * label apa saja yang ada, dan salah ketik satu huruf menghasilkan nol penerima
 * tanpa penjelasan. Daftarnya sudah ada di database sejak awal.
 *
 * `source=LEAD` memakai kategori hasil pencarian Maps, bukan label kontak —
 * dua kolom berbeda yang di layar sama-sama disebut "filter".
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const workspaceId = session.workspace.id;

  if (req.nextUrl.searchParams.get("source") === "LEAD") {
    const rows = await prisma.lead.groupBy({
      by: ["category"],
      where: { workspaceId, category: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { category: "desc" } },
      take: 100,
    });
    const data = rows.filter((r) => r.category).map((r) => ({ label: r.category as string, count: r._count._all }));
    return NextResponse.json({ success: true, data });
  }

  const rows = await prisma.contact.groupBy({
    by: ["label"],
    where: { workspaceId, label: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { label: "desc" } },
    take: 100,
  });
  const data = rows.filter((r) => r.label).map((r) => ({ label: r.label as string, count: r._count._all }));
  return NextResponse.json({ success: true, data });
}

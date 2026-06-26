import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

// Daftar area scraping tersimpan (job) milik workspace.
export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const jobs = await prisma.scraperJob.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      color: true,
      keyword: true,
      location: true,
      radiusKm: true,
      status: true,
      totalFound: true,
      createdAt: true,
    },
    take: 100,
  });
  return NextResponse.json({ success: true, data: jobs });
}

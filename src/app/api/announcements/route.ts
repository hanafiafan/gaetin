import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

// Pengumuman aktif untuk ditampilkan di dashboard pengguna.
export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const items = await prisma.announcement.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  return NextResponse.json({ success: true, data: items });
}

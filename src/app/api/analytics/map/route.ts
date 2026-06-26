import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const rows = await prisma.contact.findMany({
    where: { workspaceId: session.workspace.id, latitude: { not: null }, longitude: { not: null } },
    select: {
      id: true,
      name: true,
      phone: true,
      latitude: true,
      longitude: true,
      city: true,
      category: true,
      crmStage: true,
    },
    take: 5000,
  });

  return NextResponse.json({ success: true, data: { points: rows } });
}

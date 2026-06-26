import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const rows = await prisma.conversation.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { lastMessageAt: "desc" },
    include: { contact: { select: { name: true, phone: true } } },
    take: 200,
  });

  const data = rows.map((c) => ({
    id: c.id,
    name: c.contact.name,
    phone: c.contact.phone,
    status: c.status,
    unreadCount: c.unreadCount,
    lastMessageAt: c.lastMessageAt,
  }));
  return NextResponse.json({ success: true, data });
}

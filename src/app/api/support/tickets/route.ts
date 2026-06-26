import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const tickets = await prisma.supportTicket.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ success: true, data: tickets });
}

const Schema = z.object({
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const ticketNo = `TIX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  const ticket = await prisma.supportTicket.create({
    data: {
      workspaceId: session.workspace.id,
      ticketNo,
      subject: parsed.data.subject,
      message: parsed.data.message,
      createdById: session.user.id,
    },
  });
  return NextResponse.json({ success: true, data: { ticketNo: ticket.ticketNo } }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

const CreateSchema = z.object({
  contactId: z.string(),
  title: z.string().min(1).max(150),
  value: z.number().min(0),
  status: z.enum(["OPEN", "WON", "LOST"]).default("WON"),
  campaignId: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const agg = await prisma.deal.aggregate({
    where: { workspaceId: session.workspace.id, status: "WON" },
    _sum: { value: true },
    _count: true,
  });
  return NextResponse.json({
    success: true,
    data: { revenue: Number(agg._sum.value ?? 0), wonCount: agg._count },
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const workspaceId = session.workspace.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const contact = await prisma.contact.findFirst({
    where: { id: parsed.data.contactId, workspaceId },
    select: { id: true },
  });
  if (!contact) return fail("NOT_FOUND", "Kontak tidak ditemukan", 404);

  const deal = await prisma.deal.create({
    data: {
      workspaceId,
      contactId: contact.id,
      campaignId: parsed.data.campaignId ?? null,
      title: parsed.data.title,
      value: parsed.data.value,
      status: parsed.data.status,
      closedAt: parsed.data.status === "WON" ? new Date() : null,
      createdById: session.user.id,
    },
  });
  return NextResponse.json({ success: true, data: { id: deal.id } }, { status: 201 });
}

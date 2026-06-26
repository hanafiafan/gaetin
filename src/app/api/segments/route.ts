import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CreateSegmentSchema } from "@/lib/validators/segment";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const items = await prisma.segment.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = CreateSegmentSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const segment = await prisma.segment.create({
    data: {
      workspaceId: session.workspace.id,
      name: parsed.data.name,
      filter: parsed.data.filter as object,
      createdById: session.user.id,
    },
  });
  return NextResponse.json({ success: true, data: segment }, { status: 201 });
}

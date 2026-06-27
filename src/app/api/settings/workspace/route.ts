import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const ws = await prisma.workspace.findUnique({
    where: { id: session.workspace.id },
    select: { name: true, slug: true, createdAt: true },
  });
  return NextResponse.json({ success: true, data: ws });
}

const PutSchema = z.object({
  name: z.string().min(1).max(80),
});

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    return fail("FORBIDDEN", "Hanya Owner/Admin yang bisa mengubah nama workspace", 403);
  }

  let body: unknown;
  try { body = await req.json(); } catch { return fail("VAL_001", "Body tidak valid", 400); }
  const parsed = PutSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  await prisma.workspace.update({ where: { id: session.workspace.id }, data: { name: parsed.data.name } });
  return NextResponse.json({ success: true });
}

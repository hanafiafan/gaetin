import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const [user, prefs] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true } }),
    prisma.userPreferences.findUnique({ where: { userId: session.user.id }, select: { timezone: true } }),
  ]);

  return NextResponse.json({
    success: true,
    data: { name: user?.name ?? "", email: user?.email ?? "", timezone: prefs?.timezone ?? "Asia/Jakarta" },
  });
}

const PutSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  timezone: z.string().max(60).optional(),
});

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("VAL_001", "Body tidak valid", 400); }
  const parsed = PutSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const ops: Promise<unknown>[] = [];
  if (parsed.data.name) ops.push(prisma.user.update({ where: { id: session.user.id }, data: { name: parsed.data.name } }));
  if (parsed.data.timezone) {
    ops.push(prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: { timezone: parsed.data.timezone },
      create: { userId: session.user.id, timezone: parsed.data.timezone },
    }));
  }
  await Promise.all(ops);
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSuperAdminSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

const Schema = z.object({ action: z.enum(["lock", "unlock", "toggleSuperAdmin"]) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);

  const user = await prisma.user.findUnique({ where: { id: params.id }, select: { id: true, isSuperAdmin: true } });
  if (!user) return fail("NOT_FOUND", "User tidak ditemukan", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  if (parsed.data.action === "lock") {
    await prisma.user.update({ where: { id: user.id }, data: { lockedUntil: new Date(Date.now() + 365 * 86_400_000) } });
  } else if (parsed.data.action === "unlock") {
    await prisma.user.update({ where: { id: user.id }, data: { lockedUntil: null, failedAttempts: 0 } });
  } else {
    await prisma.user.update({ where: { id: user.id }, data: { isSuperAdmin: !user.isSuperAdmin } });
  }
  return NextResponse.json({ success: true });
}

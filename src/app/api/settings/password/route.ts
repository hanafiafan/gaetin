import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { AUTH_COOKIE, authCookieOptions } from "@/lib/auth/constants";
import { fail } from "@/lib/api";

const PutSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
});

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  let body: unknown;
  try { body = await req.json(); } catch { return fail("VAL_001", "Body tidak valid", 400); }
  const parsed = PutSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } });
  if (!user) return fail("AUTH_003", "User tidak ditemukan", 404);

  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return fail("AUTH_WRONG_PW", "Password saat ini salah", 400);

  const newHash = await hashPassword(parsed.data.newPassword);
  const changed = await prisma.user.updateMany({ where: { id: session.user.id, passwordHash: user.passwordHash }, data: { passwordHash: newHash, sessionVersion: { increment: 1 } } });
  if (!changed.count) return fail("PASSWORD_CHANGED", "Password telah berubah. Silakan masuk kembali.", 409);
  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE, "", { ...authCookieOptions(), maxAge: 0 });
  return response;
}

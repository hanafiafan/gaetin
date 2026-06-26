import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { LoginSchema } from "@/lib/validators/auth";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import {
  AUTH_COOKIE,
  authCookieOptions,
  MAX_FAILED_ATTEMPTS,
  LOCK_MINUTES,
} from "@/lib/auth/constants";
import { fail } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Pesan generik agar tidak membocorkan kredensial mana yang salah (Requirement 14.2).
const GENERIC = "Email atau password salah";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!rateLimit(`login:${ip}`, 10, 60_000).ok) {
    return fail("RATE_001", "Terlalu banyak percobaan. Coba lagi sebentar.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return fail("AUTH_001", GENERIC, 401);
  }

  // Akun terkunci (Requirement 14.4).
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return fail("AUTH_002", "Akun terkunci sementara karena terlalu banyak percobaan. Coba lagi nanti.", 423);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const attempts = user.failedAttempts + 1;
    const data =
      attempts >= MAX_FAILED_ATTEMPTS
        ? { failedAttempts: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) }
        : { failedAttempts: attempts };
    await prisma.user.update({ where: { id: user.id }, data });
    return fail("AUTH_001", GENERIC, 401);
  }

  // Reset penghitung kegagalan saat berhasil.
  await prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null },
  });

  const token = signToken(user.id);
  const res = NextResponse.json({
    success: true,
    data: { id: user.id, email: user.email, name: user.name },
  });
  res.cookies.set(AUTH_COOKIE, token, authCookieOptions());
  return res;
}

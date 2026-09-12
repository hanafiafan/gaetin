import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";
import { AUTH_COOKIE, IMPERSONATE_COOKIE, authCookieOptions } from "@/lib/auth/constants";

export async function POST(request: NextRequest) {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;

  // Catat token sebagai tidak valid agar ditolak di request berikutnya (Requirement 14.9).
  const payload = token ? verifyToken(token) : null;
  if (token && payload?.exp) {
    await prisma.invalidatedToken.upsert({ where: { token }, update: {}, create: { token, expiresAt: new Date(payload.exp * 1000) } });
  }

  // Denylist dibaca setiap request; tanpa sapuan ini tabelnya tumbuh selamanya.
  await prisma.invalidatedToken
    .deleteMany({ where: { expiresAt: { lt: new Date() } } })
    .catch(() => undefined);

  const res = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  res.cookies.set(AUTH_COOKIE, "", { ...authCookieOptions(), maxAge: 0 });
  // Tanpa ini, sesi impersonate (4 jam) bertahan melewati logout dan aktif lagi saat super-admin login berikutnya.
  res.cookies.set(IMPERSONATE_COOKIE, "", { ...authCookieOptions(), maxAge: 0 });
  return res;
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { AUTH_COOKIE, IMPERSONATE_COOKIE, authCookieOptions } from "@/lib/auth/constants";

export async function POST(request: NextRequest) {
  const token = cookies().get(AUTH_COOKIE)?.value;

  // Catat token sebagai tidak valid agar ditolak di request berikutnya (Requirement 14.9).
  if (token) {
    await prisma.invalidatedToken
      .create({ data: { token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } })
      .catch(() => undefined);
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

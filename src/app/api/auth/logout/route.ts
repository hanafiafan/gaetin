import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { AUTH_COOKIE, authCookieOptions } from "@/lib/auth/constants";

export async function POST() {
  const token = cookies().get(AUTH_COOKIE)?.value;

  // Catat token sebagai tidak valid agar ditolak di request berikutnya (Requirement 14.9).
  if (token) {
    await prisma.invalidatedToken
      .create({ data: { token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } })
      .catch(() => undefined);
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(AUTH_COOKIE, "", { ...authCookieOptions(), maxAge: 0 });
  return res;
}

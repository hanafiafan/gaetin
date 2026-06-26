import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { IMPERSONATE_COOKIE, authCookieOptions } from "@/lib/auth/constants";
import { fail } from "@/lib/api";

export async function POST() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const res = NextResponse.json({ success: true });
  res.cookies.set(IMPERSONATE_COOKIE, "", { ...authCookieOptions(), maxAge: 0 });
  return res;
}

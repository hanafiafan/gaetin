import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { alamatCallback, COOKIE_STATE, kredensialGoogle, urlPersetujuan } from "@/lib/auth/google";
import { env } from "@/lib/env";

/** Mulai masuk dengan Google: arahkan ke layar persetujuan milik Google. */
export async function GET(_req: NextRequest) {
  const kredensial = await kredensialGoogle();
  if (!kredensial) {
    return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/login?error=google_belum_disetel`);
  }

  // State mengikat permintaan ini dengan balasannya. Tanpa itu, orang lain bisa
  // memancing browser Anda menyelesaikan alur masuk milik akun mereka.
  const state = randomBytes(16).toString("base64url");
  const redirectUri = alamatCallback(env.NEXT_PUBLIC_APP_URL);

  const res = NextResponse.redirect(urlPersetujuan(kredensial.clientId, redirectUri, state));
  res.cookies.set(COOKIE_STATE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });
  return res;
}

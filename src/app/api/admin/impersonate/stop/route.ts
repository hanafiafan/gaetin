import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { IMPERSONATE_COOKIE, authCookieOptions } from "@/lib/auth/constants";
import { logAudit } from "@/lib/audit";
import { fail } from "@/lib/api";

export async function POST() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  // Mulai impersonasi dicatat, berhentinya tidak — sehingga log tidak pernah
  // menunjukkan kapan sesi admin di dalam workspace pelanggan berakhir.
  if (session.impersonating) {
    await logAudit(session.workspace.id, session.user.id, "IMPERSONATE_END", session.workspace.name);
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(IMPERSONATE_COOKIE, "", { ...authCookieOptions(), maxAge: 0 });
  return res;
}

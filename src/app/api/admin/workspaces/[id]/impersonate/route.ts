import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSuperAdminSession } from "@/lib/auth/session";
import { IMPERSONATE_COOKIE, authCookieOptions } from "@/lib/auth/constants";
import { logAudit } from "@/lib/audit";
import { fail } from "@/lib/api";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);

  const ws = await prisma.workspace.findUnique({ where: { id: params.id }, select: { id: true, name: true } });
  if (!ws) return fail("NOT_FOUND", "Workspace tidak ditemukan", 404);

  const res = NextResponse.json({ success: true });
  // Impersonate aktif 4 jam.
  res.cookies.set(IMPERSONATE_COOKIE, ws.id, { ...authCookieOptions(), maxAge: 60 * 60 * 4 });
  await logAudit(ws.id, session.user.id, "IMPERSONATE_START", ws.name);
  return res;
}

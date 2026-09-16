import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { WORKSPACE_COOKIE, authCookieOptions } from "@/lib/auth/constants";
import { fail } from "@/lib/api";

const Schema = z.object({ workspaceId: z.string().min(1) });

/** Pindah ke workspace lain yang akun ini memang jadi anggotanya. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const target = session.workspaces.find((w) => w.id === parsed.data.workspaceId);
  if (!target) return fail("NOT_FOUND", "Kamu bukan anggota workspace ini", 404);

  (await cookies()).set(WORKSPACE_COOKIE, target.id, authCookieOptions());
  return NextResponse.json({ success: true, data: target });
}

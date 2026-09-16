import { featureDenied } from "@/lib/auth/entitlements";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

/**
 * Pengecekan yang sedang berjalan di workspace ini, kalau ada.
 *
 * Kemajuannya hidup di database, tapi sebelum ini hanya disimpan di layar yang
 * membukanya. Pindah tab sekali saja membuat prosesnya terlihat batal padahal
 * masih jalan — dan orang menekan "Mulai validasi" lagi.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "waValidation");
  if (denied) return denied;

  const job = await prisma.validationRun.findFirst({
    where: { workspaceId: session.workspace.id, status: "running" },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ success: true, data: job });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { isManager } from "@/lib/auth/roles";
import { logAudit } from "@/lib/audit";
import { fail } from "@/lib/api";

async function ownedMembership(id: string, workspaceId: string) {
  return prisma.membership.findFirst({
    where: { id, workspaceId },
    include: { user: { select: { email: true } } },
  });
}

const PatchSchema = z.object({ role: z.enum(["ADMIN", "AGENT"]) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  if (!isManager(session)) return fail("FORBIDDEN", "Tidak diizinkan", 403);

  const m = await ownedMembership(params.id, session.workspace.id);
  if (!m) return fail("NOT_FOUND", "Anggota tidak ditemukan", 404);
  if (m.role === "OWNER") return fail("FORBIDDEN", "Role Owner tidak bisa diubah", 403);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  await prisma.membership.update({ where: { id: m.id }, data: { role: parsed.data.role } });
  await logAudit(session.workspace.id, session.user.id, "ROLE_CHANGED", `${m.user.email} -> ${parsed.data.role}`);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  if (!isManager(session)) return fail("FORBIDDEN", "Tidak diizinkan", 403);

  const m = await ownedMembership(params.id, session.workspace.id);
  if (!m) return fail("NOT_FOUND", "Anggota tidak ditemukan", 404);
  if (m.role === "OWNER") return fail("FORBIDDEN", "Owner tidak bisa dihapus", 403);

  await prisma.membership.delete({ where: { id: m.id } });
  await logAudit(session.workspace.id, session.user.id, "MEMBER_REMOVED", m.user.email);
  return NextResponse.json({ success: true });
}

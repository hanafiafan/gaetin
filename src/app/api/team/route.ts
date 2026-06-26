import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { isManager } from "@/lib/auth/roles";
import { logAudit } from "@/lib/audit";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const members = await prisma.membership.findMany({
    where: { workspaceId: session.workspace.id },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  const data = members.map((m) => ({
    id: m.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    isSelf: m.userId === session.user.id,
  }));
  return NextResponse.json({ success: true, data });
}

const AddSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "AGENT"]),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  if (!isManager(session)) return fail("FORBIDDEN", "Hanya Owner/Admin yang boleh menambah anggota", 403);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = AddSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (!user) {
    return fail("USER_NOT_FOUND", "User belum terdaftar. Minta dia mendaftar dulu, lalu tambahkan.", 404);
  }

  const existing = await prisma.membership.findUnique({
    where: { workspaceId_userId: { workspaceId: session.workspace.id, userId: user.id } },
  });
  if (existing) return fail("DUPLICATE", "User sudah jadi anggota workspace ini", 409);

  await prisma.membership.create({
    data: { workspaceId: session.workspace.id, userId: user.id, role: parsed.data.role },
  });
  await logAudit(session.workspace.id, session.user.id, "MEMBER_ADDED", parsed.data.email);

  return NextResponse.json({ success: true }, { status: 201 });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const existing = await prisma.messageTemplate.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    select: { id: true },
  });
  if (!existing) return fail("NOT_FOUND", "Template tidak ditemukan", 404);

  await prisma.messageTemplate.delete({ where: { id: existing.id } });
  return NextResponse.json({ success: true });
}

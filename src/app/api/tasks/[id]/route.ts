import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

async function owned(id: string, workspaceId: string) {
  return prisma.task.findFirst({ where: { id, workspaceId }, select: { id: true } });
}

const PatchSchema = z.object({ completed: z.boolean() });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const task = await owned(params.id, session.workspace.id);
  if (!task) return fail("NOT_FOUND", "Task tidak ditemukan", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  await prisma.task.update({
    where: { id: task.id },
    data: parsed.data.completed
      ? { status: "COMPLETED", completedAt: new Date() }
      : { status: "PENDING", completedAt: null },
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const task = await owned(params.id, session.workspace.id);
  if (!task) return fail("NOT_FOUND", "Task tidak ditemukan", 404);

  await prisma.task.delete({ where: { id: task.id } });
  return NextResponse.json({ success: true });
}

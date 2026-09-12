import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

const NoteSchema = z.object({ body: z.string().trim().min(1, "Catatan tidak boleh kosong").max(2000) });

export async function POST(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const contact = await prisma.contact.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    select: { id: true },
  });
  if (!contact) return fail("NOT_FOUND", "Kontak tidak ditemukan", 404);

  const parsed = NoteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const note = await prisma.contactNote.create({
    data: {
      workspaceId: session.workspace.id,
      contactId: contact.id,
      body: parsed.data.body,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ success: true, data: { id: note.id, createdAt: note.createdAt } }, { status: 201 });
}

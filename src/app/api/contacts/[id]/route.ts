import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { UpdateContactSchema } from "@/lib/validators/contact";
import { normalizePhone, isValidPhone } from "@/lib/utils";
import { fail } from "@/lib/api";

async function ownedContact(id: string, workspaceId: string) {
  return prisma.contact.findFirst({ where: { id, workspaceId } });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const existing = await ownedContact(params.id, session.workspace.id);
  if (!existing) return fail("NOT_FOUND", "Kontak tidak ditemukan", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }

  const parsed = UpdateContactSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const data = parsed.data;
  let phone: string | undefined;
  if (data.phone !== undefined) {
    phone = normalizePhone(data.phone);
    if (!isValidPhone(phone)) {
      return fail("VAL_001", "Format nomor telepon tidak valid", 400, { phone: ["8-15 digit"] });
    }
  }

  const contact = await prisma.contact.update({
    where: { id: existing.id },
    data: {
      name: data.name,
      phone,
      label: data.label,
      email: data.email,
      city: data.city,
      category: data.category,
    },
  });

  return NextResponse.json({ success: true, data: contact });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const existing = await ownedContact(params.id, session.workspace.id);
  if (!existing) return fail("NOT_FOUND", "Kontak tidak ditemukan", 404);

  await prisma.contact.delete({ where: { id: existing.id } });
  return NextResponse.json({ success: true });
}

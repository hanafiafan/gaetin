import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { BulkActionSchema } from "@/lib/validators/contact";
import { fail } from "@/lib/api";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }

  const parsed = BulkActionSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const { ids, action, label } = parsed.data;
  // Selalu batasi ke workspace pengguna agar tidak menyentuh data tenant lain.
  const where = { id: { in: ids }, workspaceId: session.workspace.id };

  if (action === "delete") {
    const res = await prisma.contact.deleteMany({ where });
    return NextResponse.json({ success: true, data: { affected: res.count } });
  }

  // action === "tag"
  const res = await prisma.contact.updateMany({ where, data: { label: label || null } });
  return NextResponse.json({ success: true, data: { affected: res.count } });
}

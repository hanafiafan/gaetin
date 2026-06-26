import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { assertCanAddContacts, QuotaExceededError } from "@/lib/contacts/quota";
import { normalizePhone, isValidPhone } from "@/lib/utils";
import { fail } from "@/lib/api";

const RowSchema = z.object({
  name: z.string().optional(),
  phone: z.string(),
  label: z.string().optional(),
  email: z.string().optional(),
  city: z.string().optional(),
  category: z.string().optional(),
});
const ImportSchema = z.object({ rows: z.array(RowSchema).min(1).max(50000) });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const workspaceId = session.workspace.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = ImportSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const total = parsed.data.rows.length;
  let invalid = 0;
  let duplicatesInFile = 0;

  // Validasi + normalisasi + dedup dalam file.
  const seen = new Set<string>();
  const unique: {
    workspaceId: string;
    name: string | null;
    phone: string;
    label: string | null;
    email: string | null;
    city: string | null;
    category: string | null;
    source: "IMPORT";
  }[] = [];

  for (const r of parsed.data.rows) {
    const phone = normalizePhone(r.phone ?? "");
    if (!phone || !isValidPhone(phone)) {
      invalid += 1;
      continue;
    }
    if (seen.has(phone)) {
      duplicatesInFile += 1;
      continue;
    }
    seen.add(phone);
    unique.push({
      workspaceId,
      name: r.name?.trim() || null,
      phone,
      label: r.label?.trim() || null,
      email: r.email?.trim() || null,
      city: r.city?.trim() || null,
      category: r.category?.trim() || null,
      source: "IMPORT",
    });
  }

  try {
    await assertCanAddContacts(workspaceId, unique.length);
  } catch (e) {
    if (e instanceof QuotaExceededError) return fail("QUOTA_EXCEEDED", e.message, 403);
    throw e;
  }

  // skipDuplicates: lewati nomor yang sudah ada di database (unique workspaceId+phone).
  const res = await prisma.contact.createMany({ data: unique, skipDuplicates: true });
  const imported = res.count;
  const duplicatesExisting = unique.length - imported;

  return NextResponse.json({
    success: true,
    data: { total, imported, invalid, duplicatesInFile, duplicatesExisting },
  });
}

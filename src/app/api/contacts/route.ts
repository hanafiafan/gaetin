import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CreateContactSchema } from "@/lib/validators/contact";
import { assertCanAddContacts, QuotaExceededError } from "@/lib/contacts/quota";
import { normalizePhone, isValidPhone } from "@/lib/utils";
import { fail } from "@/lib/api";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const sp = req.nextUrl.searchParams;
  const query = sp.get("query")?.trim() ?? "";
  const waStatus = sp.get("waStatus") ?? "";
  const page = Math.max(1, Number(sp.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(sp.get("pageSize") ?? "20")));

  const where: Prisma.ContactWhereInput = { workspaceId: session.workspace.id };
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { phone: { contains: query } },
      { label: { contains: query, mode: "insensitive" } },
    ];
  }
  if (waStatus === "ACTIVE" || waStatus === "INACTIVE" || waStatus === "UNKNOWN") {
    where.waStatus = waStatus;
  }

  const [items, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contact.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: { items, total, page, pageSize } });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }

  const parsed = CreateContactSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!isValidPhone(phone)) {
    return fail("VAL_001", "Format nomor telepon tidak valid", 400, { phone: ["8-15 digit"] });
  }

  try {
    await assertCanAddContacts(session.workspace.id, 1);
  } catch (e) {
    if (e instanceof QuotaExceededError) return fail("QUOTA_EXCEEDED", e.message, 403);
    throw e;
  }

  try {
    const contact = await prisma.contact.create({
      data: {
        workspaceId: session.workspace.id,
        name: parsed.data.name || null,
        phone,
        label: parsed.data.label || null,
        email: parsed.data.email || null,
        city: parsed.data.city || null,
        category: parsed.data.category || null,
        source: "MANUAL",
      },
    });
    return NextResponse.json({ success: true, data: contact }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return fail("DUPLICATE", "Nomor ini sudah ada di kontak Anda", 409);
    }
    throw e;
  }
}

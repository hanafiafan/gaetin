import { featureDenied } from "@/lib/auth/entitlements";
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CreateBlastSchema } from "@/lib/validators/blast";
import { fail } from "@/lib/api";
import { batasJedaKontak } from "@/lib/messaging/pacing";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "blast");
  if (denied) return denied;

  const items = await prisma.blast.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      totalRecipients: true,
      sentCount: true,
      failedCount: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "blast");
  if (denied) return denied;
  const workspaceId = session.workspace.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = CreateBlastSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const { name, accountId, messageText, scope, label } = parsed.data;

  const account = await prisma.messagingAccount.findFirst({
    where: { id: accountId, workspaceId },
    select: { id: true },
  });
  if (!account) return fail("NOT_FOUND", "Akun WhatsApp tidak ditemukan", 404);

  const where: Prisma.ContactWhereInput = { workspaceId };
  if (scope === "activeWa") where.waStatus = "ACTIVE";
  // Kontak yang baru saja dikirimi pesan massal beristirahat dulu. Orang yang
  // sama masuk tiga blast dalam seminggu adalah cara tercepat membuat dia
  // menekan "Laporkan", dan laporan adalah jalur tercepat menuju blokir.
  where.OR = [{ lastOutboundAt: null }, { lastOutboundAt: { lt: batasJedaKontak() } }];
  if (label) where.label = label;

  const contacts = await prisma.contact.findMany({ where, select: { id: true }, take: 10000 });

  // Berapa yang tersaring karena sedang beristirahat. Tanpa angka ini, daftar
  // penerima yang menyusut terlihat seperti kontak yang hilang.
  const { OR: _jeda, ...tanpaJeda } = where;
  const sebelumJeda = await prisma.contact.count({ where: tanpaJeda });
  const dilewati = Math.max(0, sebelumJeda - contacts.length);

  if (contacts.length === 0) {
    return fail(
      "EMPTY",
      dilewati > 0
        ? `Semua ${dilewati} kontak yang cocok baru dihubungi dalam 14 hari terakhir. Tunggu dulu, atau pilih label lain.`
        : "Tidak ada penerima yang cocok",
      400,
    );
  }

  const blast = await prisma.$transaction(async (tx) => {
  const blast = await tx.blast.create({
    data: {
      workspaceId,
      name,
      messageText,
      variables: { accountId, scope, label: label ?? null },
      totalRecipients: contacts.length,
      status: "DRAFT",
      createdById: session.user.id,
    },
  });

  await tx.blastMessage.createMany({
    data: contacts.map((c) => ({ blastId: blast.id, contactId: c.id })),
  });

    return blast;
  });

  return NextResponse.json(
    { success: true, data: { id: blast.id, totalRecipients: contacts.length, skipped: dilewati } },
    { status: 201 },
  );
}

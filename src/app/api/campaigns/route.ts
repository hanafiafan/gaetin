import { featureDenied } from "@/lib/auth/entitlements";
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CreateCampaignSchema } from "@/lib/validators/campaign";
import { fail } from "@/lib/api";
import { batasJedaKontak, perkiraanSelesai } from "@/lib/messaging/pacing";
import { getDailyMessagingQuota } from "@/lib/messaging/quota";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "campaigns");
  if (denied) return denied;

  const items = await prisma.campaign.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      totalRecipients: true,
      sentCount: true,
      failedCount: true,
      scheduledAt: true,
      pauseReason: true,
    },
  });
  // Perkiraan lama proses. Kuota diambil sekali untuk seluruh daftar: yang
  // membatasi adalah jatah workspace, bukan jatah per kampanye.
  const kuota = await getDailyMessagingQuota(session.workspace.id);
  const now = new Date();
  const data = items.map((c) => {
    const sisa = Math.max(0, c.totalRecipients - c.sentCount - c.failedCount);
    const jalan = c.status === "ACTIVE" || c.status === "SCHEDULED" || c.status === "DRAFT";
    return {
      ...c,
      remaining: sisa,
      estimatedFinishAt: jalan && sisa > 0
        ? perkiraanSelesai(sisa, kuota.effectiveRemaining, kuota.effectiveLimit, now)?.toISOString() ?? null
        : null,
    };
  });
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "campaigns");
  if (denied) return denied;
  const workspaceId = session.workspace.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = CreateCampaignSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const { name, accountId, messageTemplate, scope, label, scheduledAt } = parsed.data;

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

  const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
  const isScheduled = scheduledDate ? scheduledDate.getTime() > Date.now() : false;

  const campaign = await prisma.$transaction(async (tx) => {
  const campaign = await tx.campaign.create({
    data: {
      workspaceId,
      name,
      messageTemplate,
      accountId,
      totalRecipients: contacts.length,
      scheduledAt: scheduledDate,
      status: isScheduled ? "SCHEDULED" : "DRAFT",
      createdById: session.user.id,
    },
  });

  await tx.campaignMessage.createMany({
    data: contacts.map((c) => ({ campaignId: campaign.id, contactId: c.id })),
  });

    return campaign;
  });

  return NextResponse.json(
    { success: true, data: { id: campaign.id, totalRecipients: contacts.length, skipped: dilewati, status: campaign.status } },
    { status: 201 },
  );
}

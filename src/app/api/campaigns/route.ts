import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CreateCampaignSchema } from "@/lib/validators/campaign";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

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
    },
  });
  return NextResponse.json({ success: true, data: items });
}

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
  if (label) where.label = label;

  const contacts = await prisma.contact.findMany({ where, select: { id: true }, take: 10000 });
  if (contacts.length === 0) return fail("EMPTY", "Tidak ada penerima yang cocok", 400);

  const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
  const isScheduled = scheduledDate ? scheduledDate.getTime() > Date.now() : false;

  const campaign = await prisma.campaign.create({
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

  await prisma.campaignMessage.createMany({
    data: contacts.map((c) => ({ campaignId: campaign.id, contactId: c.id })),
  });

  return NextResponse.json(
    { success: true, data: { id: campaign.id, totalRecipients: contacts.length, status: campaign.status } },
    { status: 201 },
  );
}

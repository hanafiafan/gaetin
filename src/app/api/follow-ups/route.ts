import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CreateRuleSchema } from "@/lib/validators/followup";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const rules = await prisma.followUpRule.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { schedules: true } } },
  });
  const data = rules.map((r) => ({
    id: r.id,
    name: r.name,
    triggerType: r.triggerType,
    triggerValue: r.triggerValue,
    isActive: r.isActive,
    scheduleCount: r._count.schedules,
  }));
  return NextResponse.json({ success: true, data });
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
  const parsed = CreateRuleSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const account = await prisma.messagingAccount.findFirst({
    where: { id: parsed.data.accountId, workspaceId },
    select: { id: true },
  });
  if (!account) return fail("NOT_FOUND", "Akun WhatsApp tidak ditemukan", 404);

  const rule = await prisma.followUpRule.create({
    data: {
      workspaceId,
      name: parsed.data.name,
      triggerType: "NO_REPLY_DAYS",
      triggerValue: { days: parsed.data.days, accountId: parsed.data.accountId },
      messageTemplate: parsed.data.messageTemplate,
      createdById: session.user.id,
    },
  });
  return NextResponse.json({ success: true, data: { id: rule.id } }, { status: 201 });
}

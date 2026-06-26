import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CreateAccountSchema } from "@/lib/validators/whatsapp";
import { getState } from "@/lib/whatsapp/manager";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const rows = await prisma.messagingAccount.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { createdAt: "asc" },
  });

  const data = rows.map((a) => {
    const live = getState(a.id);
    return {
      id: a.id,
      label: a.label,
      phoneNumber: a.phoneNumber,
      status: live.status, // status real-time dari manager
      dailyLimit: a.dailyLimit,
      sentToday: a.sentToday,
    };
  });

  return NextResponse.json({ success: true, data });
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

  const parsed = CreateAccountSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const account = await prisma.messagingAccount.create({
    data: {
      workspaceId: session.workspace.id,
      label: parsed.data.label,
      provider: "BAILEYS",
      createdById: session.user.id,
    },
  });

  return NextResponse.json(
    { success: true, data: { id: account.id, label: account.label, status: "disconnected" } },
    { status: 201 },
  );
}

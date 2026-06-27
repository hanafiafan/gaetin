import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { CreateAccountSchema } from "@/lib/validators/whatsapp";
import { fail } from "@/lib/api";

const STATUS_MAP: Record<string, string> = {
  CONNECTED: "connected",
  CONNECTING: "connecting",
  RECONNECTING: "connecting",
  DISCONNECTED: "disconnected",
};

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const rows = await prisma.messagingAccount.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { createdAt: "asc" },
  });

  const data = rows.map((a) => ({
    id: a.id,
    label: a.label,
    phoneNumber: a.phoneNumber,
    status: STATUS_MAP[a.status] ?? "disconnected",
    dailyLimit: a.dailyLimit,
    sentToday: a.sentToday,
  }));

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

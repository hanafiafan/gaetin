import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { disconnect } from "@/lib/whatsapp/manager";
import { fail } from "@/lib/api";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const account = await prisma.messagingAccount.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    select: { id: true },
  });
  if (!account) return fail("NOT_FOUND", "Akun WhatsApp tidak ditemukan", 404);

  await disconnect(account.id);
  return NextResponse.json({ success: true });
}

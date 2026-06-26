import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { getState } from "@/lib/whatsapp/manager";
import { runValidation } from "@/lib/validator/service";
import { fail } from "@/lib/api";

const Schema = z.object({
  accountId: z.string(),
  scope: z.enum(["unknown", "all", "ids"]).default("unknown"),
  ids: z.array(z.string()).optional(),
});

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
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const account = await prisma.messagingAccount.findFirst({
    where: { id: parsed.data.accountId, workspaceId },
    select: { id: true },
  });
  if (!account) return fail("NOT_FOUND", "Akun WhatsApp tidak ditemukan", 404);
  if (getState(account.id).status !== "connected") {
    return fail("WA_NOT_CONNECTED", "Nomor WhatsApp belum terhubung", 400);
  }

  const where =
    parsed.data.scope === "ids"
      ? { workspaceId, id: { in: parsed.data.ids ?? [] } }
      : parsed.data.scope === "all"
        ? { workspaceId }
        : { workspaceId, waStatus: "UNKNOWN" as const };

  const contacts = await prisma.contact.findMany({ where, select: { id: true }, take: 10000 });
  if (contacts.length === 0) return fail("EMPTY", "Tidak ada kontak untuk divalidasi", 400);

  const jobId = randomUUID();
  void runValidation(jobId, workspaceId, account.id, contacts.map((c) => c.id)).catch(() => undefined);

  return NextResponse.json({ success: true, data: { jobId, total: contacts.length } }, { status: 202 });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSuperAdminSession } from "@/lib/auth/session";
import { addCredits } from "@/lib/credits/service";
import { logAudit } from "@/lib/audit";
import { fail } from "@/lib/api";

const Schema = z.object({
  action: z.enum(["setPlan", "addCredits", "setStatus"]),
  plan: z.enum(["STARTER", "GROWTH", "PRO"]).optional(),
  credits: z.number().int().optional(),
  status: z.enum(["TRIAL", "ACTIVE", "EXPIRED", "BLOCKED", "CANCELLED"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);

  const ws = await prisma.workspace.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!ws) return fail("NOT_FOUND", "Workspace tidak ditemukan", 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const d = parsed.data;
  if (d.action === "setPlan" && d.plan) {
    await prisma.subscription.update({ where: { workspaceId: ws.id }, data: { plan: d.plan } }).catch(() => undefined);
    await logAudit(ws.id, session.user.id, "ADMIN_SET_PLAN", d.plan);
  } else if (d.action === "addCredits" && typeof d.credits === "number") {
    await addCredits(ws.id, d.credits, "ADMIN_ADJUST");
    await logAudit(ws.id, session.user.id, "ADMIN_ADJUST_CREDITS", String(d.credits));
  } else if (d.action === "setStatus" && d.status) {
    await prisma.subscription.update({ where: { workspaceId: ws.id }, data: { status: d.status } }).catch(() => undefined);
    await logAudit(ws.id, session.user.id, "ADMIN_SET_STATUS", d.status);
  } else {
    return fail("VAL_001", "Parameter aksi tidak lengkap", 400);
  }

  return NextResponse.json({ success: true });
}

import { featureDenied } from "@/lib/auth/entitlements";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getValidation, stopValidation } from "@/lib/validator/service";
import { fail } from "@/lib/api";

export async function GET(_req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "waValidation");
  if (denied) return denied;

  const job = await getValidation(params.id, session.workspace.id);
  if (!job) return fail("NOT_FOUND", "Job validasi tidak ditemukan", 404);
  return NextResponse.json({ success: true, data: job });
}

export async function DELETE(_req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "waValidation");
  if (denied) return denied;
  await stopValidation(params.id, session.workspace.id);
  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getValidation, stopValidation } from "@/lib/validator/service";
import { fail } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const job = getValidation(params.id);
  if (!job) return fail("NOT_FOUND", "Job validasi tidak ditemukan", 404);
  return NextResponse.json({ success: true, data: job });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  stopValidation(params.id);
  return NextResponse.json({ success: true });
}

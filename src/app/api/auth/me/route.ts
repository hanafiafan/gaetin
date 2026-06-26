import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return fail("AUTH_003", "Tidak terautentikasi", 401);
  }
  return NextResponse.json({
    success: true,
    data: { user: session.user, role: session.role, workspace: session.workspace },
  });
}

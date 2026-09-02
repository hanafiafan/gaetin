import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { countCandidates, type EmailFindSource } from "@/lib/email-finder/service";
import { fail } from "@/lib/api";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const sp = req.nextUrl.searchParams;
  const source = sp.get("source");
  if (source !== "LEAD" && source !== "CONTACT") return fail("VAL_001", "source harus LEAD atau CONTACT", 400);
  const label = sp.get("label") || undefined;

  const count = await countCandidates(session.workspace.id, source as EmailFindSource, label);
  return NextResponse.json({ success: true, data: { count } });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSuperAdminSession } from "@/lib/auth/session";
import { getLandingContent, setLandingContent } from "@/lib/cms";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);
  return NextResponse.json({ success: true, data: await getLandingContent() });
}

const Schema = z.object({
  heroTitle: z.string().min(1).max(200),
  heroSubtitle: z.string().min(1).max(500),
  features: z.array(z.object({ title: z.string(), desc: z.string() })).max(12),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).max(20),
});

export async function PUT(req: NextRequest) {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  await setLandingContent(parsed.data);
  return NextResponse.json({ success: true });
}

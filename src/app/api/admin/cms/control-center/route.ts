import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSuperAdminSession } from "@/lib/auth/session";
import { getOwnerCmsSettings, setOwnerCmsSettings } from "@/lib/owner-cms";
import { fail } from "@/lib/api";

const SettingsSchema = z.object({
  featureFlags: z.record(z.boolean()),
  mediaAssets: z.record(z.string().max(1000)),
  customerFields: z
    .array(
      z.object({
        key: z.string().min(1).max(80),
        label: z.string().min(1).max(120),
        enabled: z.boolean(),
      }),
    )
    .max(50),
  experiments: z
    .array(
      z.object({
        key: z.string().min(1).max(80),
        name: z.string().min(1).max(160),
        enabled: z.boolean(),
        audience: z.string().min(1).max(80),
      }),
    )
    .max(50),
});

export async function GET() {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);
  return NextResponse.json({ success: true, data: await getOwnerCmsSettings() });
}

export async function PUT(req: NextRequest) {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }

  const parsed = SettingsSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  await setOwnerCmsSettings(parsed.data);
  return NextResponse.json({ success: true });
}

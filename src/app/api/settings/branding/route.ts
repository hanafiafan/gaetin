import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { PLANS, type PlanId } from "@/config/plans";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const b = await prisma.brandingSettings.findUnique({ where: { workspaceId: session.workspace.id } });
  return NextResponse.json({
    success: true,
    data: {
      appName: b?.appName ?? "Gaetin",
      logoUrl: b?.logoUrl ?? null,
      primaryColor: b?.primaryColor ?? "#10b981",
      secondaryColor: b?.secondaryColor ?? "#7c3aed",
    },
  });
}

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna harus hex 6 digit").optional();
const PutSchema = z.object({
  appName: z.string().min(1).max(50).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: hex,
  secondaryColor: hex,
});

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  // White-label hanya untuk paket dengan fitur whiteLabel (Pro).
  const sub = await prisma.subscription.findUnique({ where: { workspaceId: session.workspace.id } });
  const plan = (sub?.plan ?? "STARTER") as PlanId;
  if (!PLANS[plan].features.whiteLabel) {
    return fail("FEATURE_PRO", "White-label hanya tersedia di paket Pro", 403);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = PutSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const d = parsed.data;
  await prisma.brandingSettings.upsert({
    where: { workspaceId: session.workspace.id },
    update: {
      appName: d.appName,
      logoUrl: d.logoUrl === "" ? null : d.logoUrl,
      primaryColor: d.primaryColor,
      secondaryColor: d.secondaryColor,
    },
    create: {
      workspaceId: session.workspace.id,
      appName: d.appName ?? "Gaetin",
      logoUrl: d.logoUrl || null,
      primaryColor: d.primaryColor ?? "#10b981",
      secondaryColor: d.secondaryColor ?? "#7c3aed",
    },
  });
  return NextResponse.json({ success: true });
}

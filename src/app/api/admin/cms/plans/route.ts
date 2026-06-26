import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSuperAdminSession } from "@/lib/auth/session";
import { getEffectivePlans, setPlansOverride } from "@/lib/plans-store";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);
  return NextResponse.json({ success: true, data: await getEffectivePlans() });
}

const PlanSchema = z.object({
  id: z.enum(["STARTER", "GROWTH", "PRO"]),
  name: z.string().min(1).max(50),
  monthlyPrice: z.number().int().min(0),
  monthlyCredits: z.number().int().min(0),
  limits: z.object({
    scraperJobsPerMonth: z.number().int().min(1),
    scraperMaxRadiusKm: z.number().int().min(1).max(50),
    scraperMaxResultsPerJob: z.number().int().min(10).max(10_000),
    saveLeadBatchLimit: z.number().int().min(1).max(5_000),
    campaignDailyLimit: z.number().int().min(1).max(100_000),
  }),
});
const PackSchema = z.object({ id: z.string().min(1), credits: z.number().int().min(1), price: z.number().int().min(0) });
const Schema = z.object({
  plans: z.array(PlanSchema).length(3),
  topupPacks: z.array(PackSchema).max(10),
  yearlyDiscount: z.number().min(0).max(0.9),
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

  const override = {
    plans: Object.fromEntries(
      parsed.data.plans.map((p) => [
        p.id,
        {
          name: p.name,
          monthlyPrice: p.monthlyPrice,
          monthlyCredits: p.monthlyCredits,
          limits: p.limits,
        },
      ]),
    ),
    topupPacks: parsed.data.topupPacks,
    yearlyDiscount: parsed.data.yearlyDiscount,
  };
  await setPlansOverride(override);
  return NextResponse.json({ success: true });
}

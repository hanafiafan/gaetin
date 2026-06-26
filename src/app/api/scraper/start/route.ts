import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { ScraperStartSchema } from "@/lib/validators/scraper";
import { generateGrid } from "@/lib/geo";
import { runScraperJob } from "@/lib/scraper/service";
import { getWorkspacePlan, monthStart } from "@/lib/plans/limits";
import { fail } from "@/lib/api";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }

  const parsed = ScraperStartSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const d = parsed.data;
  const plan = await getWorkspacePlan(session.workspace.id);
  if (d.mode === "map" && d.radiusKm != null && d.radiusKm > plan.limits.scraperMaxRadiusKm) {
    return fail(
      "PLAN_LIMIT",
      `Radius paket ${plan.name} maksimal ${plan.limits.scraperMaxRadiusKm} km.`,
      403,
      { radiusKm: [`Maksimal ${plan.limits.scraperMaxRadiusKm} km untuk paket ini`] },
    );
  }

  const jobsThisMonth = await prisma.scraperJob.count({
    where: {
      workspaceId: session.workspace.id,
      createdAt: { gte: monthStart() },
    },
  });
  if (jobsThisMonth >= plan.limits.scraperJobsPerMonth) {
    return fail(
      "PLAN_LIMIT",
      `Kuota scraper paket ${plan.name} bulan ini sudah habis (${plan.limits.scraperJobsPerMonth} job).`,
      403,
    );
  }

  const gridPoints =
    d.mode === "map" && d.centerLat != null && d.centerLng != null && d.radiusKm != null
      ? generateGrid(d.centerLat, d.centerLng, d.radiusKm).length
      : 1;

  const job = await prisma.scraperJob.create({
    data: {
      workspaceId: session.workspace.id,
      keyword: d.keyword,
      location: d.locationLabel ?? d.location ?? null,
      name: d.name ?? null,
      color: d.color ?? null,
      centerLat: d.centerLat ?? null,
      centerLng: d.centerLng ?? null,
      radiusKm: d.radiusKm ?? null,
      dataFields: d.dataFields ?? ["phone", "address", "website", "email", "category", "rating", "coordinates"],
      gridPoints,
      status: "RUNNING",
      createdById: session.user.id,
    },
  });

  // Jalankan di latar belakang (di produksi: enqueue ke BullMQ worker).
  void runScraperJob(job.id).catch(() => undefined);

  return NextResponse.json({ success: true, data: { id: job.id, status: job.status } }, { status: 202 });
}

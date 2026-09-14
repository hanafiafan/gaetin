import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { ScraperStartSchema } from "@/lib/validators/scraper";
import { getWorkspacePlan, monthStart } from "@/lib/plans/limits";
import { fail } from "@/lib/api";
import { env } from "@/lib/env";

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
  const job = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Workspace" WHERE id = ${session.workspace.id} FOR UPDATE`;
    const jobsThisMonth = await tx.scraperJob.count({
      where: {
        workspaceId: session.workspace.id,
        createdAt: { gte: monthStart() },
      },
    });
    if (jobsThisMonth >= plan.limits.scraperJobsPerMonth) {
      return null;
    }

    return tx.scraperJob.create({
      data: {
        workspaceId: session.workspace.id,
        keyword: d.keyword,
        location: d.location ?? null,
        name: d.name ?? null,
        color: d.color ?? null,
        dataFields: d.dataFields ?? ["phone", "address", "website", "email", "category", "rating", "coordinates"],
        status: "RUNNING",
        createdById: session.user.id,
      },
    });

  });
  if (!job) return fail("PLAN_LIMIT", `Kuota scraper paket ${plan.name} bulan ini sudah habis (${plan.limits.scraperJobsPerMonth} job).`, 403);

  // Token HMAC deterministik dari job.id + workspaceId — tidak perlu disimpan di DB.
  // Extension mengirim token ini sebagai X-Extension-Token header ke /api/scraper/extension.
  const extensionToken = createHmac("sha256", env.JWT_SECRET)
    .update(`${job.id}:${job.workspaceId}`)
    .digest("hex");

  return NextResponse.json({ success: true, data: { id: job.id, status: job.status, extensionToken } }, { status: 202 });
}

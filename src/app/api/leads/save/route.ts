import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { computeScore } from "@/lib/leads/scoring";
import { deductCredits, InsufficientCreditsError } from "@/lib/credits/service";
import { addContactToFirstPipelineStage } from "@/lib/crm/pipeline";
import { getWorkspacePlan } from "@/lib/plans/limits";
import { CREDIT_COSTS } from "@/config/plans";
import { fail } from "@/lib/api";

const Schema = z.object({
  ids: z.array(z.string()).min(1).max(1000),
  addToPipeline: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const workspaceId = session.workspace.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const plan = await getWorkspacePlan(workspaceId);
  if (parsed.data.ids.length > plan.limits.saveLeadBatchLimit) {
    return fail(
      "PLAN_LIMIT",
      `Paket ${plan.name} hanya bisa menyimpan ${plan.limits.saveLeadBatchLimit} lead per batch.`,
      403,
    );
  }

  const leads = await prisma.lead.findMany({ where: { id: { in: parsed.data.ids }, workspaceId } });

  let saved = 0;
  let skipped = 0;
  let pipelineAdded = 0;
  let outOfCredits = false;

  for (const l of leads) {
    if (!l.phone) {
      skipped += 1;
      continue;
    }
    const existing = await prisma.contact.findUnique({
      where: { workspaceId_phone: { workspaceId, phone: l.phone } },
    });

    if (existing) {
      // Sudah jadi kontak: tautkan saja, tidak memotong kredit.
      await prisma.lead.update({ where: { id: l.id }, data: { saved: true, contactId: existing.id } });
      if (parsed.data.addToPipeline) {
        const pipeline = await addContactToFirstPipelineStage(workspaceId, existing.id);
        if (pipeline.added) pipelineAdded += 1;
      }
      skipped += 1;
      continue;
    }

    // Kontak baru: potong kredit dulu.
    try {
      await deductCredits(workspaceId, CREDIT_COSTS.saveLead, "SAVE_LEAD");
    } catch (e) {
      if (e instanceof InsufficientCreditsError) {
        outOfCredits = true;
        break;
      }
      throw e;
    }

    const c = await prisma.contact.create({
      data: {
        workspaceId,
        name: l.businessName,
        phone: l.phone,
        email: l.email,
        website: l.website,
        address: l.address,
        city: l.city,
        category: l.category,
        latitude: l.latitude,
        longitude: l.longitude,
        source: "SCRAPER",
        score: computeScore(l),
      },
    });
    await prisma.lead.update({ where: { id: l.id }, data: { saved: true, contactId: c.id } });
    if (parsed.data.addToPipeline) {
      const pipeline = await addContactToFirstPipelineStage(workspaceId, c.id);
      if (pipeline.added) pipelineAdded += 1;
    }
    saved += 1;
  }

  return NextResponse.json({
    success: true,
    data: { saved, skipped, pipelineAdded, total: leads.length, outOfCredits },
  });
}

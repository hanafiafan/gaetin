import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { computeScore } from "@/lib/leads/scoring";
import { deductCreditsInTransaction, InsufficientCreditsError } from "@/lib/credits/service";
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
    try {
      const result = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "Workspace" WHERE id = ${workspaceId} FOR UPDATE`;
        let contact = await tx.contact.findUnique({ where: { workspaceId_phone: { workspaceId, phone: l.phone! } } });
        const created = !contact;
        if (!contact) {
          await deductCreditsInTransaction(tx, workspaceId, CREDIT_COSTS.saveLead, "SAVE_LEAD");
          contact = await tx.contact.create({ data: { workspaceId, name: l.businessName, phone: l.phone!, email: l.email, website: l.website, address: l.address, city: l.city, category: l.category, latitude: l.latitude, longitude: l.longitude, source: "SCRAPER", score: computeScore(l) } });
        }
        await tx.lead.update({ where: { id: l.id }, data: { saved: true, contactId: contact.id } });
        return { id: contact.id, created };
      });
      if (result.created) saved++; else skipped++;
      if (parsed.data.addToPipeline) {
        const pipeline = await addContactToFirstPipelineStage(workspaceId, result.id);
        if (pipeline.added) pipelineAdded++;
      }
    } catch (err) {
      if (err instanceof InsufficientCreditsError) { outOfCredits = true; break; }
      throw err;
    }
  }

  return NextResponse.json({
    success: true,
    data: { saved, skipped, pipelineAdded, total: leads.length, outOfCredits },
  });
}

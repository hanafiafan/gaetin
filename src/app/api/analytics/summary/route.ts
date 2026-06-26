import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const workspaceId = session.workspace.id;

  const [leads, contacts, contacted, replied, wonAgg, sources, byCampaignRaw] = await Promise.all([
    prisma.lead.count({ where: { workspaceId } }),
    prisma.contact.count({ where: { workspaceId } }),
    prisma.contact.count({ where: { workspaceId, lastContacted: { not: null } } }),
    prisma.conversation.count({ where: { workspaceId } }),
    prisma.deal.aggregate({ where: { workspaceId, status: "WON" }, _sum: { value: true }, _count: true }),
    prisma.contact.groupBy({ by: ["source"], where: { workspaceId }, _count: true }),
    prisma.deal.groupBy({ by: ["campaignId"], where: { workspaceId, status: "WON" }, _sum: { value: true } }),
  ]);

  // Nama kampanye untuk atribusi revenue.
  const campaignIds = byCampaignRaw.map((r) => r.campaignId).filter((x): x is string => !!x);
  const campaigns = campaignIds.length
    ? await prisma.campaign.findMany({ where: { id: { in: campaignIds } }, select: { id: true, name: true } })
    : [];
  const nameById = new Map(campaigns.map((c) => [c.id, c.name]));

  const byCampaign = byCampaignRaw.map((r) => ({
    name: r.campaignId ? nameById.get(r.campaignId) ?? "Kampanye" : "Tanpa kampanye",
    revenue: Number(r._sum.value ?? 0),
  }));

  const funnel = [
    { stage: "Lead mentah", value: leads },
    { stage: "Kontak", value: contacts },
    { stage: "Dihubungi", value: contacted },
    { stage: "Dibalas", value: replied },
    { stage: "Closing", value: wonAgg._count },
  ];

  return NextResponse.json({
    success: true,
    data: {
      funnel,
      sources: sources.map((s) => ({ source: s.source, count: s._count })),
      revenue: Number(wonAgg._sum.value ?? 0),
      wonCount: wonAgg._count,
      byCampaign,
    },
  });
}

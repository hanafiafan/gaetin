import { featureDenied } from "@/lib/auth/entitlements";
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

/**
 * Siapa saja yang sudah dikirimi, dan yang gagal beserta sebabnya.
 *
 * Angka "131 penerima · 7%" tidak menjawab pertanyaan yang sebenarnya dipakai
 * orang: nomor mana yang sudah masuk. Datanya sudah ada di CampaignMessage
 * sejak awal, hanya tidak pernah ditampilkan.
 */
export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "campaigns");
  if (denied) return denied;

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    select: { id: true },
  });
  if (!campaign) return fail("NOT_FOUND", "Pengiriman tidak ditemukan", 404);

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") ?? "";
  const page = Math.max(1, Number(sp.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(sp.get("pageSize") ?? "25")));

  const where: Prisma.CampaignMessageWhereInput = { campaignId: campaign.id };
  if (status === "SENT") where.status = { in: ["SENT", "DELIVERED", "READ"] };
  else if (status === "FAILED") where.status = "FAILED";
  else if (status === "PENDING") where.status = "PENDING";

  const [rows, total] = await Promise.all([
    prisma.campaignMessage.findMany({
      where,
      include: { contact: { select: { name: true, phone: true } } },
      orderBy: [{ sentAt: "desc" }, { createdAt: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.campaignMessage.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      items: rows.map((r) => ({
        id: r.id,
        name: r.contact.name,
        phone: r.contact.phone,
        status: r.status,
        sentAt: r.sentAt,
        errorReason: r.errorReason,
      })),
      total,
      page,
      pageSize,
    },
  });
}

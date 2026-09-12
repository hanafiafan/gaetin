import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";
import { buildTimeline, summarize } from "@/lib/contacts/timeline";

/**
 * Seluruh riwayat satu kontak dalam satu urutan waktu.
 *
 * Datanya sudah lama ada, hanya tercecer di enam tabel dan enam halaman: pesan
 * masuk di Pesan Masuk, pesan keluar di Kirim Pesan, tugas di Daftar Tugas,
 * penjualan di Peluang Penjualan. Tidak ada satu pun tempat untuk menjawab
 * pertanyaan paling dasar seorang penjual — "ada apa saja dengan orang ini?".
 */

export async function GET(_req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const workspaceId = session.workspace.id;
  const contact = await prisma.contact.findFirst({ where: { id: params.id, workspaceId } });
  if (!contact) return fail("NOT_FOUND", "Kontak tidak ditemukan", 404);

  const [messages, notes, tasks, deals, cards, dnc] = await Promise.all([
    prisma.inboxMessage.findMany({
      where: { conversation: { workspaceId, contactId: contact.id } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.contactNote.findMany({ where: { contactId: contact.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.task.findMany({ where: { contactId: contact.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.deal.findMany({ where: { contactId: contact.id, workspaceId }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.pipelineCard.findMany({
      where: { contactId: contact.id },
      include: { column: { select: { name: true } } },
      orderBy: { movedAt: "desc" },
      take: 1,
    }),
    prisma.doNotContact.findFirst({ where: { workspaceId, phone: contact.phone } }),
  ]);

  const sources = { messages, notes, tasks, deals };
  const entries = buildTimeline(sources);

  return NextResponse.json({
    success: true,
    data: {
      contact: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        city: contact.city,
        category: contact.category,
        label: contact.label,
        website: contact.website,
        waStatus: contact.waStatus,
        score: contact.score,
        source: contact.source,
        createdAt: contact.createdAt.toISOString(),
        lastInboundAt: contact.lastInboundAt?.toISOString() ?? null,
        lastOutboundAt: contact.lastOutboundAt?.toISOString() ?? null,
      },
      stage: cards[0]?.column.name ?? null,
      optedOut: Boolean(dnc),
      summary: summarize(sources),
      entries,
    },
  });
}

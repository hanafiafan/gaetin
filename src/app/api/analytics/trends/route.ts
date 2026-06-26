import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const workspaceId = session.workspace.id;

  const since = new Date(Date.now() - 29 * 86_400_000);

  const [contacts, blastMsgs, campMsgs] = await Promise.all([
    prisma.contact.findMany({
      where: { workspaceId, createdAt: { gte: since } },
      select: { createdAt: true },
      take: 20000,
    }),
    prisma.blastMessage.findMany({
      where: { status: "SENT", sentAt: { gte: since }, blast: { workspaceId } },
      select: { sentAt: true },
      take: 20000,
    }),
    prisma.campaignMessage.findMany({
      where: { status: "SENT", sentAt: { gte: since }, campaign: { workspaceId } },
      select: { sentAt: true },
      take: 20000,
    }),
  ]);

  // Siapkan 30 bucket harian.
  const buckets = new Map<string, { contacts: number; messages: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(since.getTime() + i * 86_400_000);
    buckets.set(dayKey(d), { contacts: 0, messages: 0 });
  }
  for (const c of contacts) {
    const b = buckets.get(dayKey(c.createdAt));
    if (b) b.contacts += 1;
  }
  for (const m of [...blastMsgs, ...campMsgs]) {
    if (!m.sentAt) continue;
    const b = buckets.get(dayKey(m.sentAt));
    if (b) b.messages += 1;
  }

  const days = [...buckets.entries()].map(([date, v]) => ({ date: date.slice(5), ...v }));
  return NextResponse.json({ success: true, data: { days } });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { scrapeEmailFromWebsite } from "@/lib/enrichment/email-scraper";
import { fail } from "@/lib/api";

const BodySchema = z.object({ ids: z.array(z.string()).min(1).max(30) });
const CONCURRENCY = 5;

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// Kunjungi website kontak yang belum punya email, coba temukan satu lewat regex.
// Dibatasi 30 kontak/request + concurrency 5 supaya request tetap selesai dalam waktu wajar.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const contacts = await prisma.contact.findMany({
    where: {
      id: { in: parsed.data.ids },
      workspaceId: session.workspace.id,
      email: null,
      website: { not: null },
    },
    select: { id: true, website: true },
  });

  let found = 0;
  await mapLimit(contacts, CONCURRENCY, async (c) => {
    const email = await scrapeEmailFromWebsite(c.website!);
    if (email) {
      await prisma.contact.update({ where: { id: c.id }, data: { email } });
      found += 1;
    }
  });

  return NextResponse.json({ success: true, data: { processed: contacts.length, found } });
}

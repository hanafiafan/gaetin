import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const ws = await prisma.workspace.findUnique({
    where: { id: session.workspace.id },
    select: { scraperProvider: true, googleMapsApiKey: true },
  });
  return NextResponse.json({
    success: true,
    data: { provider: ws?.scraperProvider ?? "OSM_SCRAPER", hasGoogleKey: !!ws?.googleMapsApiKey },
  });
}

const PutSchema = z.object({
  provider: z.enum(["OSM_SCRAPER", "GOOGLE_PLACES"]),
  googleMapsApiKey: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = PutSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  // Tolak Google tanpa key (kecuali key sudah tersimpan sebelumnya).
  if (parsed.data.provider === "GOOGLE_PLACES" && parsed.data.googleMapsApiKey === undefined) {
    const ws = await prisma.workspace.findUnique({
      where: { id: session.workspace.id },
      select: { googleMapsApiKey: true },
    });
    if (!ws?.googleMapsApiKey) {
      return fail("KEY_REQUIRED", "Masukkan Google Maps API key untuk memakai Google Places", 400);
    }
  }

  const data: { scraperProvider: string; googleMapsApiKey?: string | null } = {
    scraperProvider: parsed.data.provider,
  };
  if (parsed.data.googleMapsApiKey !== undefined) {
    data.googleMapsApiKey = parsed.data.googleMapsApiKey.trim() || null;
  }

  await prisma.workspace.update({ where: { id: session.workspace.id }, data });
  return NextResponse.json({ success: true });
}

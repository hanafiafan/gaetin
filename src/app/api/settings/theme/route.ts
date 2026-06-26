import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

const Schema = z.object({ theme: z.enum(["LIGHT", "DARK"]) });

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  await prisma.userPreferences.upsert({
    where: { userId: session.user.id },
    update: { theme: parsed.data.theme },
    create: { userId: session.user.id, theme: parsed.data.theme },
  });
  return NextResponse.json({ success: true });
}

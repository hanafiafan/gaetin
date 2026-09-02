import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { createAndRunEmailFindJob } from "@/lib/email-finder/service";
import { fail } from "@/lib/api";

const CreateSchema = z.object({
  source: z.enum(["LEAD", "CONTACT"]),
  label: z.string().max(50).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const items = await prisma.emailFindJob.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      source: true,
      label: true,
      status: true,
      totalTargets: true,
      processed: true,
      found: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const result = await createAndRunEmailFindJob(
    session.workspace.id,
    parsed.data.source,
    parsed.data.label,
    session.user.id,
  );
  if (!result) return fail("EMPTY", "Tidak ada lead/kontak yang cocok (punya website, belum ada email)", 400);

  return NextResponse.json({ success: true, data: result }, { status: 201 });
}

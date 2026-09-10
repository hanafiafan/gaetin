import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { createTopupCheckout } from "@/lib/billing/service";
import { isManager } from "@/lib/auth/roles";
import { fail } from "@/lib/api";

const Schema = z.object({ packId: z.string() });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  // Top-up membuat tagihan Midtrans sungguhan — sama seperti checkout paket,
  // ini membelanjakan uang workspace dan bukan wewenang anggota biasa.
  if (!isManager(session)) return fail("FORBIDDEN", "Hanya Owner/Admin yang bisa membeli kredit", 403);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  try {
    const result = await createTopupCheckout(session.workspace.id, session.user.email, parsed.data.packId);
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    return fail("BILLING_ERROR", e instanceof Error ? e.message : "Gagal membuat top-up", 502);
  }
}

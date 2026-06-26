import { NextResponse } from "next/server";
import { getEffectivePlans } from "@/lib/plans-store";

export const dynamic = "force-dynamic";

// Publik: dipakai landing & halaman billing untuk menampilkan harga terkini.
export async function GET() {
  const data = await getEffectivePlans();
  return NextResponse.json({ success: true, data });
}

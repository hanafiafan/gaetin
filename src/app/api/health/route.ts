import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Health check untuk monitoring / load balancer.
// Tanpa ini Next memanggang hasilnya saat build (route ini tidak menyentuh
// request), sehingga endpoint melaporkan status build — bukan status database.
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: "up" });
  } catch {
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}

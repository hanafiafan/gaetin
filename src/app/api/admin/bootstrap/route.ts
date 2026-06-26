import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

// ONE-TIME bootstrap endpoint — creates superadmin if none exists.
// Safe: returns 409 immediately if any superadmin already exists.
// DELETE THIS FILE after first successful login.

export async function POST() {
  const existing = await prisma.user.findFirst({ where: { isSuperAdmin: true } });
  if (existing) {
    return NextResponse.json(
      { error: "Superadmin sudah ada. Gunakan kredensial yang sudah terdaftar." },
      { status: 409 }
    );
  }

  const email = "demo@nusantara.test";
  const passwordHash = await bcrypt.hash("Demo1234", 10);

  const user = await prisma.user.create({
    data: {
      email,
      name: "Demo User",
      passwordHash,
      isSuperAdmin: true,
      preferences: { create: {} },
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "Demo Workspace",
      slug: "demo",
      branding: { create: {} },
      subscription: {
        create: {
          plan: "GROWTH",
          status: "TRIAL",
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      memberships: {
        create: { userId: user.id, role: "OWNER" },
      },
    },
  });

  await prisma.pipeline.create({
    data: {
      workspaceId: workspace.id,
      name: "Sales Pipeline",
      columns: {
        create: [
          { name: "Lead Baru", order: 0, color: "#3b82f6" },
          { name: "Dihubungi", order: 1, color: "#f59e0b" },
          { name: "Negosiasi", order: 2, color: "#8b5cf6" },
          { name: "Closed Won", order: 3, color: "#22c55e" },
          { name: "Closed Lost", order: 4, color: "#ef4444" },
        ],
      },
    },
  });

  return NextResponse.json({
    success: true,
    message: "Superadmin berhasil dibuat. HAPUS file ini setelah login!",
    email,
    password: "Demo1234",
  });
}

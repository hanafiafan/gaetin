import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@nusantara.test";
  const passwordHash = await bcrypt.hash("Demo1234", 10);

  // User demo
  const user = await prisma.user.upsert({
    where: { email },
    update: { isSuperAdmin: true },
    create: {
      email,
      name: "Demo User",
      passwordHash,
      isSuperAdmin: true,
      preferences: { create: {} },
    },
  });

  // Workspace demo + membership OWNER
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo",
      branding: { create: {} },
      subscription: {
        create: {
          plan: "GROWTH",
          status: "TRIAL",
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      memberships: {
        create: { userId: user.id, role: "OWNER" },
      },
    },
  });

  // Pipeline default
  const existing = await prisma.pipeline.findFirst({ where: { workspaceId: workspace.id } });
  if (!existing) {
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
  }

  console.log("✅ Seed selesai. Login demo: %s / Demo1234", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { RegisterSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE, authCookieOptions } from "@/lib/auth/constants";
import { fail } from "@/lib/api";
import { TRIAL_CREDITS } from "@/config/plans";
import { rateLimit, clientIp } from "@/lib/rate-limit";

function slugify(s: string): string {
  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  return base || "workspace";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!rateLimit(`register:${ip}`, 5, 60_000).ok) {
    return fail("RATE_001", "Terlalu banyak percobaan. Coba lagi sebentar.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("VAL_001", "Body permintaan tidak valid", 400);
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail("AUTH_005", "Email sudah terdaftar", 409);
  }

  const passwordHash = await hashPassword(password);
  const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash, preferences: { create: {} } },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: `Workspace ${name}`,
        slug,
        credits: TRIAL_CREDITS,
        branding: { create: {} },
        subscription: { create: { plan: "GROWTH", status: "TRIAL", trialEndsAt } },
        memberships: { create: { userId: user.id, role: "OWNER" } },
        pipelines: {
          create: {
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
        },
      },
    });

    return { user, workspace };
  });

  const token = signToken(result.user.id);
  const res = NextResponse.json(
    { success: true, data: { id: result.user.id, email, name } },
    { status: 201 },
  );
  res.cookies.set(AUTH_COOKIE, token, authCookieOptions());
  return res;
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { RegisterSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";
import { buatAkunDenganWorkspace } from "@/lib/auth/provision";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE, authCookieOptions } from "@/lib/auth/constants";
import { fail } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendWelcomeEmail } from "@/lib/email/service";


export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!(await rateLimit(`register:${ip}`, 5, 60_000)).ok) {
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
  const result = await buatAkunDenganWorkspace({ name, email, passwordHash });

  // Fire-and-forget welcome email
  sendWelcomeEmail(email, name).catch(() => {});

  const token = signToken(result.user.id);
  const res = NextResponse.json(
    { success: true, data: { id: result.user.id, email, name } },
    { status: 201 },
  );
  res.cookies.set(AUTH_COOKIE, token, authCookieOptions());
  return res;
}

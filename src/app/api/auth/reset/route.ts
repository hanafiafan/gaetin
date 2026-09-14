import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { AUTH_COOKIE, authCookieOptions } from "@/lib/auth/constants";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { hashToken, tokenMasihBerlaku } from "@/lib/auth/password-reset";
import { fail } from "@/lib/api";

const Schema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(8, "Password baru minimal 8 karakter").max(200),
});

/** Pakai tautan atur ulang untuk memasang password baru. */
export async function POST(req: NextRequest) {
  // Token panjangnya 32 byte acak, jadi menebaknya mustahil — tapi pembatasan
  // ini menutup percobaan membanjiri endpoint-nya.
  const batas = await rateLimit(`reset:ip:${clientIp(req)}`, 20, 15 * 60_000);
  if (!batas.ok) return fail("RATE_LIMIT", "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.", 429);

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const tokenHash = hashToken(parsed.data.token);
  const tersimpan = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  // Satu pesan untuk semua kegagalan token: kedaluwarsa, sudah dipakai, dan
  // tidak pernah ada tidak perlu dibedakan oleh orang yang memegang tautannya.
  if (!tokenMasihBerlaku(tersimpan)) {
    return fail("TOKEN_INVALID", "Tautan ini sudah tidak berlaku. Minta tautan baru dari halaman Lupa password.", 400);
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const berhasil = await prisma.$transaction(async (tx) => {
    // Menandai token terpakai DULU, dengan syarat masih kosong: dua permintaan
    // bersamaan dengan tautan yang sama hanya menyisakan satu pemenang.
    const dipakai = await tx.passwordResetToken.updateMany({
      where: { tokenHash, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (!dipakai.count) return false;

    // sessionVersion naik: semua sesi lama langsung mati. Kalau akun ini
    // diambil alih orang lain, mengatur ulang password harus mengusirnya.
    await tx.user.update({
      where: { id: tersimpan!.userId },
      data: { passwordHash, sessionVersion: { increment: 1 } },
    });
    return true;
  });

  if (!berhasil) {
    return fail("TOKEN_INVALID", "Tautan ini sudah tidak berlaku. Minta tautan baru dari halaman Lupa password.", 400);
  }

  const response = NextResponse.json({ success: true, data: { message: "Password berhasil diubah. Silakan masuk dengan password baru." } });
  response.cookies.set(AUTH_COOKIE, "", { ...authCookieOptions(), maxAge: 0 });
  return response;
}

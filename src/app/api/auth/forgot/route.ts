import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { isEmailConfigured, sendEmail } from "@/lib/email/service";
import { buatTokenReset, emailAturUlang } from "@/lib/auth/password-reset";
import { env } from "@/lib/env";
import { fail } from "@/lib/api";

const Schema = z.object({ email: z.string().email("Format email tidak valid") });

/**
 * Minta tautan atur ulang password.
 *
 * Jawabannya SELALU sama, ada atau tidak ada akun dengan email itu. Jawaban
 * yang berbeda akan mengubah halaman ini jadi alat untuk memeriksa email mana
 * yang terdaftar di sini — dan daftar itu sendiri sudah berharga bagi orang
 * yang mengumpulkannya.
 */
const JAWABAN_SAMA = {
  success: true,
  data: { message: "Kalau email itu terdaftar, tautan atur ulang sudah dikirim. Periksa kotak masuk dan folder spam." },
};

export async function POST(req: NextRequest) {
  // Dibatasi per IP dan per email: tanpa ini, satu orang bisa membanjiri kotak
  // masuk orang lain hanya dengan menekan tombol berulang kali.
  const perIp = await rateLimit(`forgot:ip:${clientIp(req)}`, 10, 15 * 60_000);
  if (!perIp.ok) return fail("RATE_LIMIT", "Terlalu banyak permintaan. Coba lagi beberapa menit lagi.", 429);

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("VAL_001", "Validasi gagal", 400, parsed.error.flatten().fieldErrors);

  const email = parsed.data.email.trim().toLowerCase();
  const perEmail = await rateLimit(`forgot:email:${email}`, 3, 15 * 60_000);
  if (!perEmail.ok) return NextResponse.json(JAWABAN_SAMA);

  // Kalau email belum disetel admin, tautannya tidak akan pernah sampai.
  // Mengaku "sudah dikirim" di keadaan itu membuat orang menunggu selamanya.
  if (!(await isEmailConfigured())) {
    return fail(
      "EMAIL_NOT_CONFIGURED",
      "Pengiriman email belum disetel di sistem ini, jadi tautan atur ulang tidak bisa dikirim. Hubungi admin workspace Anda.",
      503,
    );
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true } });
  if (!user) return NextResponse.json(JAWABAN_SAMA);

  const { token, tokenHash, expiresAt } = buatTokenReset();

  await prisma.$transaction(async (tx) => {
    // Permintaan baru membatalkan yang lama: satu akun tidak boleh punya
    // beberapa tautan hidup sekaligus.
    await tx.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    await tx.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });
  });

  const tautan = `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  const isi = emailAturUlang(user.name, tautan);
  const hasil = await sendEmail({ to: user.email, subject: isi.subject, html: isi.html });

  if (!hasil.ok) {
    console.error("Gagal mengirim email atur ulang password", hasil.error);
    // Tokennya dibatalkan supaya tidak ada tautan menggantung yang tidak
    // pernah sampai ke siapa pun.
    await prisma.passwordResetToken.updateMany({ where: { tokenHash, usedAt: null }, data: { usedAt: new Date() } });
    return fail("EMAIL_FAILED", "Email gagal dikirim. Coba lagi sebentar lagi.", 502);
  }

  return NextResponse.json(JAWABAN_SAMA);
}

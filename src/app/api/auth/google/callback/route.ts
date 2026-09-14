import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE, authCookieOptions } from "@/lib/auth/constants";
import { buatAkunDenganWorkspace } from "@/lib/auth/provision";
import { alamatCallback, bacaIdToken, COOKIE_STATE, kredensialGoogle, tukarKode } from "@/lib/auth/google";
import { sendWelcomeEmail } from "@/lib/email/service";
import { env } from "@/lib/env";

const APP = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

/** Kembali ke halaman Masuk dengan sebab yang bisa dibaca orang. */
function gagal(sebab: string) {
  const res = NextResponse.redirect(`${APP}/login?error=${sebab}`);
  res.cookies.set(COOKIE_STATE, "", { path: "/", maxAge: 0 });
  return res;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const kode = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // Orangnya menekan "Batal" di layar Google.
  if (url.searchParams.get("error")) return gagal("google_dibatalkan");
  if (!kode || !state) return gagal("google_balasan_tidak_lengkap");

  const stateTersimpan = req.cookies.get(COOKIE_STATE)?.value;
  if (!stateTersimpan || stateTersimpan !== state) return gagal("google_state_tidak_cocok");

  const kredensial = await kredensialGoogle();
  if (!kredensial) return gagal("google_belum_disetel");

  const hasil = await tukarKode(kode, kredensial, alamatCallback(APP));
  if ("error" in hasil) {
    console.error("Gagal menukar kode Google", hasil.error);
    return gagal("google_gagal_menukar_kode");
  }

  const profil = bacaIdToken(hasil.idToken, kredensial.clientId);
  if (!profil) return gagal("google_token_tidak_sah");
  if (!profil.emailTerverifikasi) return gagal("google_email_belum_terverifikasi");

  // Dicari lewat googleId dulu, baru email. Orang yang mengganti alamat Gmail-nya
  // tetap masuk ke akun yang sama, bukan mendapat akun kosong baru.
  let user = await prisma.user.findUnique({ where: { googleId: profil.googleId } });
  let baru = false;

  if (!user) {
    const lewatEmail = await prisma.user.findUnique({ where: { email: profil.email } });
    if (lewatEmail) {
      // Menautkan akun yang sudah ada. Aman karena Google sudah memastikan
      // orang ini benar-benar memegang alamat email tersebut.
      user = await prisma.user.update({
        where: { id: lewatEmail.id },
        data: { googleId: profil.googleId },
      });
    } else {
      const dibuat = await buatAkunDenganWorkspace({
        name: profil.name,
        email: profil.email,
        googleId: profil.googleId,
      });
      user = dibuat.user;
      baru = true;
    }
  }

  if (baru) sendWelcomeEmail(user.email, user.name).catch(() => {});

  const res = NextResponse.redirect(`${APP}/dashboard`);
  res.cookies.set(AUTH_COOKIE, signToken(user.id, user.sessionVersion), authCookieOptions());
  res.cookies.set(COOKIE_STATE, "", { path: "/", maxAge: 0 });
  return res;
}

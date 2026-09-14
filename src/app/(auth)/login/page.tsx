import { Suspense } from "react";
import LoginForm from "@/app/(auth)/login/login-form";
import { googleSiap } from "@/lib/auth/google";

/**
 * Tombol Google hanya dirender kalau kredensialnya benar-benar sudah diisi.
 * Tombol yang tampak hidup tapi mati adalah hal pertama yang dicoba pengguna
 * baru — dan hal pertama yang membuat mereka menyimpulkan sistemnya rusak.
 */
export default async function LoginPage() {
  const siap = await googleSiap();
  return (
    <Suspense fallback={<div className="flex h-[400px] items-center justify-center text-muted-foreground">Memuat...</div>}>
      <LoginForm googleSiap={siap} />
    </Suspense>
  );
}

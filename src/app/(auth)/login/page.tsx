import { Suspense } from "react";
import LoginForm from "@/app/(auth)/login/login-form";
import { googleSiap } from "@/lib/auth/google";

/**
 * Dirender per permintaan, bukan disiapkan saat build.
 *
 * Halaman ini membaca setelan dari database untuk tahu apakah tombol Google
 * perlu dirender. Tanpa baris ini Next.js mencoba memprerender-nya saat build,
 * dan di dalam Docker build tidak ada database sama sekali — build-nya gagal.
 * Lolos di komputer lokal cuma karena Postgres-nya kebetulan hidup.
 */
export const dynamic = "force-dynamic";

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

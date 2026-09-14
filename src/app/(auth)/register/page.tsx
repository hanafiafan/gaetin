import { Suspense } from "react";
import RegisterForm from "@/app/(auth)/register/register-form";
import { googleSiap } from "@/lib/auth/google";

/**
 * Dirender per permintaan: halaman ini membaca setelan dari database untuk
 * tahu apakah tombol Google perlu dirender, dan saat build (di dalam Docker)
 * database itu tidak ada. Sama persis dengan halaman Masuk.
 */
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const siap = await googleSiap();
  return (
    <Suspense fallback={<div className="flex h-[400px] items-center justify-center text-muted-foreground">Memuat...</div>}>
      <RegisterForm googleSiap={siap} />
    </Suspense>
  );
}

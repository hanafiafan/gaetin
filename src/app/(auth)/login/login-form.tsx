"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { INPUT_CLASS, LABEL_CLASS, BUTTON_CLASS } from "@/components/brand/field";

/** Pesan untuk tiap kegagalan yang dikirim balik oleh route callback Google. */
const PESAN_ERROR: Record<string, string> = {
  google_belum_disetel: "Masuk dengan Google belum disetel di sistem ini. Hubungi admin workspace Anda.",
  google_dibatalkan: "Masuk dengan Google dibatalkan.",
  google_email_belum_terverifikasi: "Email Google Anda belum terverifikasi, jadi belum bisa dipakai masuk.",
  google_state_tidak_cocok: "Sesi masuk sudah kedaluwarsa. Coba tekan tombolnya sekali lagi.",
  google_balasan_tidak_lengkap: "Balasan dari Google tidak lengkap. Coba lagi.",
  google_gagal_menukar_kode: "Gagal memverifikasi akun Google. Coba lagi sebentar lagi.",
  google_token_tidak_sah: "Balasan dari Google tidak bisa diverifikasi. Coba lagi.",
};

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.2 5.4-4.7 7l7.6 5.9c4.4-4.1 6.8-10.1 6.8-17.4z" />
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C1 16.3 0 20 0 24s1 7.7 2.6 10.8l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.2-8.3 2.2-6.4 0-11.7-3.7-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export default function LoginForm({ googleSiap }: { googleSiap: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? "Gagal masuk");
        return;
      }
      const next = searchParams.get("next");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      router.push(safeNext);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const alasan = searchParams.get("error");
  const pesanGoogle = alasan ? (PESAN_ERROR[alasan] ?? "Masuk dengan Google gagal. Coba lagi.") : null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="cg-display text-4xl">Masuk</h1>
        <p className="mt-3 text-sm text-muted-foreground">Lanjutkan lead, outreach, dan CRM dari workspace Anda.</p>
      </div>

      {pesanGoogle && (
        <div className="mb-4 border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {pesanGoogle}
        </div>
      )}

      {googleSiap && (
        <>
          <a
            href="/api/auth/google"
            className="mb-4 flex h-12 w-full items-center justify-center gap-3 border border-border bg-card text-sm font-bold text-foreground transition hover:border-foreground/40"
          >
            <GoogleMark />
            Masuk dengan Google
          </a>
          <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            atau pakai email
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <label htmlFor="email" className={LABEL_CLASS}>Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className={INPUT_CLASS} required />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className={LABEL_CLASS}>Password</label>
          <div className="relative">
            <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`${INPUT_CLASS} pr-12`} required />
            <button
              type="button"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-muted-foreground transition hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <Link href="/lupa-password" className="text-xs font-semibold text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline">
            Lupa password?
          </Link>
        </div>
        <button type="submit" className={BUTTON_CLASS} disabled={loading}>
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-xs text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/register" className="font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4">
          Daftar gratis
        </Link>
      </p>
    </div>
  );
}

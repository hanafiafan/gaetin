"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { INPUT_CLASS, LABEL_CLASS, BUTTON_CLASS } from "@/components/brand/field";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [ulangi, setUlangi] = useState("");
  const [lihat, setLihat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selesai, setSelesai] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // Diperiksa di sini supaya salah ketik ketahuan sebelum tokennya terpakai:
    // token sekali pakai, jadi kirim yang salah berarti minta tautan baru.
    if (password !== ulangi) {
      setError("Dua password yang Anda ketik belum sama.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? "Gagal mengubah password");
        return;
      }
      setSelesai(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div>
        <h1 className="cg-display text-4xl">Tautan tidak lengkap</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Tautan yang Anda buka tidak memuat kode apa pun. Minta tautan baru dari halaman Lupa password.
        </p>
        <Link href="/lupa-password" className="mt-6 inline-block font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4">
          Minta tautan baru
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="cg-display text-4xl">Buat password baru</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Minimal 8 karakter. Setelah diubah, semua perangkat yang sedang masuk akan keluar sendiri.
        </p>
      </div>

      {selesai ? (
        <div className="border-l-2 border-success bg-success/5 px-4 py-3 text-sm text-success">
          Password berhasil diubah. Mengarahkan ke halaman Masuk...
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="password" className={LABEL_CLASS}>Password baru</label>
            <div className="relative">
              <input
                id="password"
                type={lihat ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${INPUT_CLASS} pr-12`}
                minLength={8}
                required
              />
              <button
                type="button"
                aria-label={lihat ? "Sembunyikan password" : "Tampilkan password"}
                aria-pressed={lihat}
                onClick={() => setLihat((v) => !v)}
                className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-muted-foreground transition hover:text-foreground"
              >
                {lihat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ulangi" className={LABEL_CLASS}>Ulangi password baru</label>
            <input
              id="ulangi"
              type={lihat ? "text" : "password"}
              value={ulangi}
              onChange={(e) => setUlangi(e.target.value)}
              className={INPUT_CLASS}
              minLength={8}
              required
            />
          </div>

          <button type="submit" className={BUTTON_CLASS} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan password baru"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex h-[400px] items-center justify-center text-muted-foreground">Memuat...</div>}>
      <ResetForm />
    </Suspense>
  );
}

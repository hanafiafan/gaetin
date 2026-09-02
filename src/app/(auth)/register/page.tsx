"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Search, Send, Zap } from "lucide-react";
import { INPUT_CLASS, LABEL_CLASS, BUTTON_CLASS } from "@/components/brand/field";

const trialBenefits = [
  { icon: Zap, text: "100 kredit langsung aktif" },
  { icon: Search, text: "Scraping lead Google Maps" },
  { icon: Send, text: "Blast WhatsApp ke kontak" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        const detail = json?.error?.details?.password?.[0];
        setError(detail ?? json?.error?.message ?? "Gagal mendaftar");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-primary p-5 text-primary-foreground">
        <p className="cg-display text-2xl">Mulai gratis — 100 kredit aktif</p>
        <div className="mt-3 flex flex-col gap-2">
          {trialBenefits.map(({ icon: Icon, text }) => (
            <div key={text} className="cg-label flex items-center gap-2.5">
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {text}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-8">
          <h1 className="cg-display text-4xl">Buat workspace</h1>
          <p className="mt-3 text-sm text-muted-foreground">Daftar gratis, tidak perlu kartu kredit.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="name" className={LABEL_CLASS}>Nama lengkap</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Budi Santoso" className={INPUT_CLASS} required />
          </div>
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
            <p className="text-xs text-muted-foreground">Min. 8 karakter, huruf besar, huruf kecil, dan angka.</p>
          </div>
          <button type="submit" className={BUTTON_CLASS} disabled={loading}>
            {loading ? "Memproses..." : "Daftar & mulai gratis"}
          </button>
        </form>

        <p className="mt-6 text-xs text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

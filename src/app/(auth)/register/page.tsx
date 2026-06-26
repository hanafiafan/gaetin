"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Search, Send, Zap } from "lucide-react";

const INPUT_CLASS = "h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none";

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
      <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4">
        <p className="text-sm font-black text-white">Mulai gratis — 100 kredit langsung aktif</p>
        <div className="mt-3 flex flex-col gap-2">
          {trialBenefits.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-xs text-slate-300">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20">
                <Icon className="h-3 w-3 text-primary" />
              </span>
              {text}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="mb-5">
          <h1 className="text-xl font-black text-white">Buat workspace Gaetin</h1>
          <p className="mt-1 text-sm text-slate-400">Daftar gratis, tidak perlu kartu kredit.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-bold text-slate-400">Nama lengkap</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Budi Santoso" className={INPUT_CLASS} required />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold text-slate-400">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className={INPUT_CLASS} required />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-bold text-slate-400">Password</label>
            <div className="relative">
              <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`${INPUT_CLASS} pr-12`} required />
              <button
                type="button"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/10 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500">Min. 8 karakter, huruf besar, huruf kecil, dan angka.</p>
          </div>
          <button type="submit" className="h-11 w-full rounded-full bg-primary font-bold text-black transition hover:bg-primary/90 disabled:opacity-50" disabled={loading}>
            {loading ? "Memproses..." : "Daftar & mulai gratis"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { INPUT_CLASS, LABEL_CLASS, BUTTON_CLASS } from "@/components/brand/field";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [pesan, setPesan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPesan(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? "Gagal mengirim tautan");
        return;
      }
      setPesan(json?.data?.message ?? "Tautan sudah dikirim.");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="cg-display text-4xl">Lupa password</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Masukkan email akun Anda. Kami kirimkan tautan untuk membuat password baru.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>
        )}
        {pesan && (
          <div className="border-l-2 border-success bg-success/5 px-4 py-3 text-sm text-success">{pesan}</div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className={LABEL_CLASS}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className={INPUT_CLASS}
            required
          />
        </div>

        <button type="submit" className={BUTTON_CLASS} disabled={loading}>
          {loading ? "Mengirim..." : "Kirim tautan"}
        </button>
      </form>

      <p className="mt-6 text-xs text-muted-foreground">
        Sudah ingat passwordnya?{" "}
        <Link href="/login" className="font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4">
          Kembali ke Masuk
        </Link>
      </p>
    </div>
  );
}

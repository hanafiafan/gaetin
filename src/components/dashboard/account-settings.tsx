"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

const TIMEZONES = [
  { value: "Asia/Jakarta", label: "WIB — Jakarta, Sumatera, Kalimantan Barat (UTC+7)" },
  { value: "Asia/Makassar", label: "WITA — Makassar, Bali, NTB, Kalimantan Timur (UTC+8)" },
  { value: "Asia/Jayapura", label: "WIT — Jayapura, Maluku (UTC+9)" },
  { value: "Asia/Singapore", label: "SGT — Singapura (UTC+8)" },
  { value: "Asia/Kuala_Lumpur", label: "MYT — Kuala Lumpur (UTC+8)" },
  { value: "UTC", label: "UTC — Universal (UTC+0)" },
];

type Status = "idle" | "saving" | "saved" | "error";

export default function AccountSettings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [profileStatus, setProfileStatus] = useState<Status>("idle");
  const [profileError, setProfileError] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwStatus, setPwStatus] = useState<Status>("idle");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/settings/profile");
      const j = await r.json();
      if (j.success) { setName(j.data.name); setEmail(j.data.email); setTimezone(j.data.timezone); }
    })();
  }, []);

  async function saveProfile() {
    setProfileStatus("saving");
    setProfileError("");
    const r = await fetch("/api/settings/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), timezone }),
    });
    const j = await r.json();
    if (!r.ok) { setProfileError(j?.error?.message ?? "Gagal menyimpan"); setProfileStatus("error"); return; }
    setProfileStatus("saved");
    setTimeout(() => setProfileStatus("idle"), 3000);
  }

  async function changePassword() {
    if (!currentPw || !newPw) return;
    setPwStatus("saving");
    setPwError("");
    const r = await fetch("/api/settings/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    const j = await r.json();
    if (!r.ok) { setPwError(j?.error?.message ?? "Gagal mengubah password"); setPwStatus("error"); return; }
    setPwStatus("saved");
    setCurrentPw("");
    setNewPw("");
    setTimeout(() => setPwStatus("idle"), 3000);
  }

  return (
    <div className="space-y-8">
      {/* Profil */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Profil Akun</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400">Nama lengkap</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400">Email</label>
            <input
              value={email}
              disabled
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400">Zona waktu</label>
          <select
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white focus:border-primary/40 focus:outline-none"
          >
            {TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500">Digunakan untuk penjadwalan campaign dan format tampilan waktu.</p>
        </div>

        {profileError && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{profileError}</div>}

        <button
          onClick={saveProfile}
          disabled={profileStatus === "saving"}
          className="flex h-10 items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-5 text-sm font-bold text-primary transition hover:bg-primary/25 disabled:opacity-50"
        >
          {profileStatus === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
          {profileStatus === "saved" && <CheckCircle2 className="h-4 w-4" />}
          {profileStatus === "saved" ? "Tersimpan" : "Simpan profil"}
        </button>
      </div>

      <div className="border-t border-white/[0.06]" />

      {/* Password */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Ganti Password</h3>
          <p className="mt-1 text-xs text-slate-600">Minimal 8 karakter.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400">Password saat ini</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none"
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400">Password baru</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="••••••••"
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none"
              />
              <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {pwError && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{pwError}</div>}
        {pwStatus === "saved" && <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">Password berhasil diubah.</div>}

        <button
          onClick={changePassword}
          disabled={pwStatus === "saving" || !currentPw || !newPw}
          className="flex h-10 items-center gap-2 rounded-full border border-white/[0.08] px-5 text-sm font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary disabled:opacity-40"
        >
          {pwStatus === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
          Ubah password
        </button>
      </div>
    </div>
  );
}

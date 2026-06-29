"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BrandingSettings() {
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [appName, setAppName] = useState("Gaetin");
  const [primaryColor, setPrimaryColor] = useState("#10b981");
  const [logoUrl, setLogoUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [rm, rb] = await Promise.all([fetch("/api/billing/me"), fetch("/api/settings/branding")]);
      const [jm, jb] = await Promise.all([rm.json(), rb.json()]);
      if (jm.success) setIsPro(jm.data.plan === "PRO");
      if (jb.success) {
        setAppName(jb.data.appName);
        setPrimaryColor(jb.data.primaryColor);
        setLogoUrl(jb.data.logoUrl ?? "");
      }
    })();
  }, []);

  async function save() {
    setError(null);
    setSaved(false);
    const r = await fetch("/api/settings/branding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appName, primaryColor, logoUrl: logoUrl || "" }),
    });
    const j = await r.json();
    if (!r.ok) { setError(j?.error?.message ?? "Gagal menyimpan"); return; }
    setSaved(true);
  }

  const INPUT_CLASS = "h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none";
  const LABEL_CLASS = "text-xs font-bold text-muted-foreground";

  if (isPro === false) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        White-label (ganti nama &amp; warna aplikasi) tersedia di paket <span className="font-bold text-foreground">Pro</span>.{" "}
        <Link href="/dashboard/billing" className="font-bold text-primary hover:underline">Upgrade ke Pro</Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="space-y-1.5">
        <label className={LABEL_CLASS}>Nama aplikasi</label>
        <input
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          maxLength={50}
          className={INPUT_CLASS}
        />
      </div>
      <div className="space-y-1.5">
        <label className={LABEL_CLASS}>Warna primer</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded-xl border border-border bg-transparent"
            aria-label="Warna primer"
          />
          <span className="text-sm font-mono text-foreground/80">{primaryColor}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className={LABEL_CLASS}>URL logo (opsional)</label>
        <input
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://..."
          className={INPUT_CLASS}
        />
      </div>
      {error && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {saved && <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">Tersimpan. Muat ulang untuk melihat perubahan.</div>}
      <button
        onClick={save}
        className="flex h-10 items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-5 text-sm font-bold text-primary transition hover:bg-primary/25"
      >
        Simpan branding
      </button>
    </div>
  );
}

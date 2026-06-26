"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    if (!r.ok) {
      setError(j?.error?.message ?? "Gagal menyimpan");
      return;
    }
    setSaved(true);
  }

  if (isPro === false) {
    return (
      <div className="rounded-md border bg-muted/30 p-4 text-sm">
        White-label (ganti nama & warna aplikasi) tersedia di paket <span className="font-medium">Pro</span>.{" "}
        <Link href="/dashboard/billing" className="text-primary hover:underline">Upgrade ke Pro</Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Nama aplikasi</label>
        <Input value={appName} onChange={(e) => setAppName(e.target.value)} maxLength={50} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Warna primer</label>
        <div className="flex items-center gap-2">
          <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-12 rounded-md border" aria-label="Warna primer" />
          <span className="text-sm text-muted-foreground">{primaryColor}</span>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">URL logo (opsional)</label>
        <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
      </div>
      {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {saved && <div className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600">Tersimpan. Muat ulang untuk melihat perubahan.</div>}
      <Button onClick={save}>Simpan branding</Button>
    </div>
  );
}

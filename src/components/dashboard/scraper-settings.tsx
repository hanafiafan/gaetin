"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function ScraperSettings() {
  const [provider, setProvider] = useState<"OSM_SCRAPER" | "GOOGLE_PLACES">("OSM_SCRAPER");
  const [hasGoogleKey, setHasGoogleKey] = useState(false);
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/settings/scraper");
      const j = await r.json();
      if (j.success) { setProvider(j.data.provider); setHasGoogleKey(j.data.hasGoogleKey); }
    })();
  }, []);

  async function save() {
    setError(null);
    setSaved(false);
    const body: Record<string, unknown> = { provider };
    if (key.trim()) body.googleMapsApiKey = key.trim();
    const r = await fetch("/api/settings/scraper", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!r.ok) { setError(j?.error?.message ?? "Gagal menyimpan"); return; }
    setSaved(true);
    setKey("");
    if (key.trim()) setHasGoogleKey(true);
  }

  const options = [
    {
      value: "OSM_SCRAPER" as const,
      title: "OSM + Scraper (gratis)",
      desc: "Peta OpenStreetMap + scraper. Gratis, data lebih banyak (termasuk email), tetapi melanggar ToS Google & berisiko ban nomor.",
    },
    {
      value: "GOOGLE_PLACES" as const,
      title: "Google Places API (resmi)",
      desc: "Data langsung dari Google secara legal. Berbayar (pakai API key sendiri), maks 60 hasil/pencarian, tanpa email.",
    },
  ];

  return (
    <div className="max-w-xl space-y-4">
      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            onClick={() => setProvider(opt.value)}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
              provider === opt.value
                ? "border-primary/30 bg-primary/[0.06]"
                : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
            )}
          >
            <input
              type="radio"
              checked={provider === opt.value}
              onChange={() => setProvider(opt.value)}
              className="mt-0.5 accent-primary"
            />
            <span>
              <span className="block text-sm font-bold text-white">{opt.title}</span>
              <span className="mt-0.5 block text-xs text-slate-400">{opt.desc}</span>
            </span>
          </label>
        ))}
      </div>

      {provider === "GOOGLE_PLACES" && (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400">Google Maps API Key</label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={hasGoogleKey ? "•••••• (tersimpan, isi untuk mengganti)" : "Tempel API key Google"}
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none"
          />
          <p className="text-xs text-slate-500">
            Aktifkan Places API (New) di Google Cloud, lalu tempel key di sini.
          </p>
        </div>
      )}

      {error && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {saved && <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">Tersimpan.</div>}

      <button
        onClick={save}
        className="flex h-10 items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-5 text-sm font-bold text-primary transition hover:bg-primary/25"
      >
        Simpan
      </button>
    </div>
  );
}

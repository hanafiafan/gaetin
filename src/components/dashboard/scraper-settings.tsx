"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      if (j.success) {
        setProvider(j.data.provider);
        setHasGoogleKey(j.data.hasGoogleKey);
      }
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
    if (!r.ok) {
      setError(j?.error?.message ?? "Gagal menyimpan");
      return;
    }
    setSaved(true);
    setKey("");
    if (key.trim()) setHasGoogleKey(true);
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="space-y-2">
        <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3">
          <input
            type="radio"
            checked={provider === "OSM_SCRAPER"}
            onChange={() => setProvider("OSM_SCRAPER")}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-medium">OSM + Scraper (gratis)</span>
            <span className="block text-xs text-muted-foreground">
              Peta OpenStreetMap + scraper. Gratis, data lebih banyak (termasuk email), tetapi
              melanggar ToS Google &amp; berisiko ban nomor.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3">
          <input
            type="radio"
            checked={provider === "GOOGLE_PLACES"}
            onChange={() => setProvider("GOOGLE_PLACES")}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-medium">Google Places API (resmi)</span>
            <span className="block text-xs text-muted-foreground">
              Data langsung dari Google secara legal. Berbayar (pakai API key sendiri), maks 60
              hasil/pencarian, tanpa email.
            </span>
          </span>
        </label>
      </div>

      {provider === "GOOGLE_PLACES" && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Google Maps API Key</label>
          <Input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={hasGoogleKey ? "•••••• (tersimpan, isi untuk mengganti)" : "Tempel API key Google"}
          />
          <p className="text-xs text-muted-foreground">
            Aktifkan Places API (New) di Google Cloud, lalu tempel key di sini.
          </p>
        </div>
      )}

      {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {saved && <div className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600">Tersimpan.</div>}

      <Button onClick={save}>Simpan</Button>
    </div>
  );
}

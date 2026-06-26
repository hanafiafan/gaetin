"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLandingEditor() {
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [featuresJson, setFeaturesJson] = useState("[]");
  const [faqJson, setFaqJson] = useState("[]");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/admin/cms/landing");
      const j = await r.json();
      if (j.success) {
        setHeroTitle(j.data.heroTitle);
        setHeroSubtitle(j.data.heroSubtitle);
        setFeaturesJson(JSON.stringify(j.data.features, null, 2));
        setFaqJson(JSON.stringify(j.data.faq, null, 2));
      }
    })();
  }, []);

  async function save() {
    setError(null);
    setSaved(false);
    let features: unknown;
    let faq: unknown;
    try {
      features = JSON.parse(featuresJson);
      faq = JSON.parse(faqJson);
    } catch {
      setError("Format JSON fitur/FAQ tidak valid.");
      return;
    }
    const r = await fetch("/api/admin/cms/landing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroTitle, heroSubtitle, features, faq }),
    });
    const j = await r.json();
    if (!r.ok) {
      setError(j?.error?.message ?? "Gagal menyimpan");
      return;
    }
    setSaved(true);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Judul hero</label>
        <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Subjudul hero</label>
        <textarea value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} rows={3} className="w-full rounded-md border border-input bg-background p-3 text-sm" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Fitur (JSON: [{'{ "title": "...", "desc": "..." }'}])</label>
        <textarea value={featuresJson} onChange={(e) => setFeaturesJson(e.target.value)} rows={8} className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs" />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">FAQ (JSON: [{'{ "q": "...", "a": "..." }'}])</label>
        <textarea value={faqJson} onChange={(e) => setFaqJson(e.target.value)} rows={8} className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs" />
      </div>
      {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {saved && <div className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600">Tersimpan. Konten landing diperbarui.</div>}
      <Button onClick={save}>Simpan konten</Button>
    </div>
  );
}

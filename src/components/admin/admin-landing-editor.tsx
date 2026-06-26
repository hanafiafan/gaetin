"use client";

import { useEffect, useState } from "react";

const INPUT_CLASS = "h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none";
const TEXTAREA_CLASS = "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none";
const MONO_CLASS = "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 font-mono text-xs text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none";
const LABEL_CLASS = "text-sm font-bold text-white";

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
    if (!r.ok) { setError(j?.error?.message ?? "Gagal menyimpan"); return; }
    setSaved(true);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="space-y-1">
        <label className={LABEL_CLASS}>Judul hero</label>
        <input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className={INPUT_CLASS} />
      </div>
      <div className="space-y-1">
        <label className={LABEL_CLASS}>Subjudul hero</label>
        <textarea value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} rows={3} className={TEXTAREA_CLASS} />
      </div>
      <div className="space-y-1">
        <label className={LABEL_CLASS}>Fitur (JSON: [{'{'}&#34;title&#34;: &#34;...&#34;, &#34;desc&#34;: &#34;...&#34;{'}'}])</label>
        <textarea value={featuresJson} onChange={(e) => setFeaturesJson(e.target.value)} rows={8} className={MONO_CLASS} />
      </div>
      <div className="space-y-1">
        <label className={LABEL_CLASS}>FAQ (JSON: [{'{'}&#34;q&#34;: &#34;...&#34;, &#34;a&#34;: &#34;...&#34;{'}'}])</label>
        <textarea value={faqJson} onChange={(e) => setFaqJson(e.target.value)} rows={8} className={MONO_CLASS} />
      </div>
      {error && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {saved && <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">Tersimpan. Konten landing diperbarui.</div>}
      <button onClick={save} className="flex h-10 items-center rounded-full border border-primary/30 bg-primary/15 px-5 text-sm font-bold text-primary transition hover:bg-primary/25">
        Simpan konten
      </button>
    </div>
  );
}

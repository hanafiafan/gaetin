"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Chrome,
  Download,
  ExternalLink,
  Map,
  MapPin,
  Monitor,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

const STEPS = [
  {
    id: 1,
    icon: Chrome,
    title: "Install Ekstensi Chrome",
    subtitle: "Download & aktifkan ekstensi Gaetin",
  },
  {
    id: 2,
    icon: Map,
    title: "Konfigurasi Google Maps",
    subtitle: "Aktifkan mode update otomatis",
  },
  {
    id: 3,
    icon: Shield,
    title: "Izin Browser",
    subtitle: "Aktifkan popup & lokasi",
  },
  {
    id: 4,
    icon: Zap,
    title: "Siap Scraping!",
    subtitle: "Mulai job pertamamu",
  },
];

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [checked, setChecked] = useState<Record<number, boolean[]>>({
    1: [false, false, false],
    2: [false, false, false],
    3: [false, false],
    4: [],
  });

  function toggle(stepId: number, idx: number) {
    setChecked((prev) => {
      const copy = [...(prev[stepId] ?? [])];
      copy[idx] = !copy[idx];
      return { ...prev, [stepId]: copy };
    });
  }

  const allChecked = (stepId: number) =>
    checked[stepId]?.every(Boolean) ?? true;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium tracking-wide text-primary">
          <Sparkles className="h-3 w-3" />
          Panduan Setup
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Setup Ekstensi Gaetin
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Ikuti 4 langkah ini agar scraping Google Maps berjalan sempurna.
        </p>
      </div>

      {/* Step progress */}
      <div className="cg-card rounded-2xl p-4">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = s.id < step;
            return (
              <div key={s.id} className="flex flex-1 items-center">
                <button
                  onClick={() => setStep(s.id)}
                  className="flex flex-col items-center gap-1.5 min-w-0 flex-1"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                      isDone
                        ? "border-primary bg-primary text-white"
                        : isActive
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-white/10 bg-white/[0.03] text-slate-500"
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`hidden text-center text-[10px] font-semibold leading-tight sm:block ${
                      isActive ? "text-primary" : isDone ? "text-primary/70" : "text-slate-600"
                    }`}
                  >
                    {s.subtitle}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px flex-1 max-w-8 mx-1 ${
                      s.id < step ? "bg-primary" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="cg-card rounded-2xl p-6">
        {step === 1 && <StepInstall onCheck={(i) => toggle(1, i)} checked={checked[1]} />}
        {step === 2 && <StepMaps onCheck={(i) => toggle(2, i)} checked={checked[2]} />}
        {step === 3 && <StepPermissions onCheck={(i) => toggle(3, i)} checked={checked[3]} />}
        {step === 4 && <StepReady />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {step > 1 ? (
          <button
            onClick={() => setStep((p) => p - 1)}
            className="flex h-10 items-center gap-2 rounded-full border border-white/[0.08] px-5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            ← Kembali
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            onClick={() => setStep((p) => p + 1)}
            className="flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            {allChecked(step) ? "Lanjut" : "Lewati"}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <Link
            href="/dashboard/scraper"
            className="flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            Mulai Scraping
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Step 1: Install Extension                                      */
/* ────────────────────────────────────────────────────────────── */

function StepInstall({
  checked,
  onCheck,
}: {
  checked: boolean[];
  onCheck: (i: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Chrome className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Install Ekstensi Chrome</h2>
          <p className="mt-1 text-sm text-slate-400">
            Ekstensi ini yang akan berjalan di browser kamu dan melakukan scraping otomatis dari Google Maps.
          </p>
        </div>
      </div>

      {/* Download card */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white">Ekstensi Gaetin untuk Chrome</p>
            <p className="mt-0.5 text-xs text-slate-400">Versi terbaru · Kompatibel dengan Chrome 100+</p>
          </div>
          <a
            href="/extension.crx"
            download
            className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        </div>
      </div>

      {/* Install instructions */}
      <div>
        <p className="mb-3 text-sm font-semibold text-slate-300">Cara install manual (.crx):</p>
        <div className="space-y-2.5">
          {[
            { text: "Buka Chrome → ketik chrome://extensions di address bar", sub: "Tekan Enter" },
            { text: "Aktifkan toggle \"Mode pengembang\" di pojok kanan atas", sub: "Developer mode" },
            { text: "Drag & drop file .crx yang didownload ke halaman extensions", sub: "Atau klik \"Muat yang dibongkar\"" },
            { text: "Klik \"Tambahkan ekstensi\" saat konfirmasi muncul", sub: "Ikon Gaetin akan muncul di toolbar" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-black text-primary">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{item.text}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2.5 border-t border-white/[0.06] pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Konfirmasi</p>
        {[
          "Sudah download file ekstensi",
          "Sudah mengaktifkan Mode Pengembang di Chrome",
          "Ikon Gaetin sudah muncul di toolbar Chrome",
        ].map((label, i) => (
          <label key={i} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 transition hover:bg-white/[0.04]">
            <div
              onClick={() => onCheck(i)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                checked?.[i]
                  ? "border-primary bg-primary text-white"
                  : "border-white/20 bg-transparent"
              }`}
            >
              {checked?.[i] && <Check className="h-3 w-3" />}
            </div>
            <span className={`text-sm ${checked?.[i] ? "text-white" : "text-slate-400"}`}>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Step 2: Google Maps Config                                     */
/* ────────────────────────────────────────────────────────────── */

function StepMaps({
  checked,
  onCheck,
}: {
  checked: boolean[];
  onCheck: (i: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
          <Map className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Konfigurasi Google Maps</h2>
          <p className="mt-1 text-sm text-slate-400">
            Ada satu pengaturan wajib di Google Maps yang <strong className="text-white">harus</strong> diaktifkan agar scraping berjalan.
          </p>
        </div>
      </div>

      {/* Visual mockup */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1a1c2a]">
        {/* Maps top bar */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-[#202230] px-4 py-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/">
            <MapPin className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex-1 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-slate-400">
            kafe jakarta pusat
          </div>
          <span className="text-[10px] text-slate-500">× 📍</span>
        </div>

        {/* Results panel */}
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-300">Hasil · 50+</p>
            <span className="text-[10px] text-slate-500">ℹ</span>
          </div>

          {/* THE CHECKBOX — highlighted */}
          <div className="mb-4 rounded-xl border-2 border-red-500/60 bg-red-500/5 px-3 py-2.5 shadow-[0_0_18px_rgba(239,68,68,0.25)]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-primary/50 bg-primary/">
                <Check className="h-2.5 w-2.5 text-primary" />
              </div>
              <span className="text-sm font-medium text-white">
                Perbarui hasil saat peta digeser
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-400">
                Wajib aktif!
              </span>
              <span className="text-[10px] text-slate-500">Tanpa ini scraping tidak bisa berjalan</span>
            </div>
          </div>

          {/* Sample results */}
          <div className="space-y-1.5">
            {["Kopi Nako · ★4.8", "Escobar Coffee · ★4.7", "Filosofi Kopi · ★4.6"].map((item) => (
              <div key={item} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
                <div className="h-8 w-8 rounded-lg bg-white/[0.06]" />
                <span className="text-xs text-slate-400">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div>
        <p className="mb-3 text-sm font-semibold text-slate-300">Langkah-langkah:</p>
        <div className="space-y-2.5">
          {[
            { text: "Buka maps.google.com di browser Chrome", action: null },
            { text: "Ketik kata kunci bisnis yang ingin kamu scrape", action: "Contoh: \"kafe jakarta\", \"salon bandung\"" },
            { text: "Centang kotak \"Perbarui hasil saat peta digeser\"", action: "Ada di bagian atas daftar hasil pencarian" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-black text-amber-400">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{item.text}</p>
                {item.action && <p className="mt-0.5 text-xs text-slate-500">{item.action}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <a
        href="https://maps.google.com"
        target="_blank"
        rel="noreferrer"
        className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-white/[0.08] text-sm font-semibold text-slate-300 transition hover:border-primary/30 hover:text-primary"
      >
        <ExternalLink className="h-4 w-4" />
        Buka Google Maps
      </a>

      {/* Checklist */}
      <div className="space-y-2.5 border-t border-white/[0.06] pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Konfirmasi</p>
        {[
          "Sudah membuka Google Maps di Chrome",
          "Sudah mencari kata kunci bisnis",
          "Kotak \"Perbarui hasil saat peta digeser\" sudah dicentang",
        ].map((label, i) => (
          <label key={i} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 transition hover:bg-white/[0.04]">
            <div
              onClick={() => onCheck(i)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                checked?.[i]
                  ? "border-primary bg-primary text-white"
                  : "border-white/20 bg-transparent"
              }`}
            >
              {checked?.[i] && <Check className="h-3 w-3" />}
            </div>
            <span className={`text-sm ${checked?.[i] ? "text-white" : "text-slate-400"}`}>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Step 3: Browser Permissions                                    */
/* ────────────────────────────────────────────────────────────── */

function StepPermissions({
  checked,
  onCheck,
}: {
  checked: boolean[];
  onCheck: (i: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Aktifkan Izin Browser</h2>
          <p className="mt-1 text-sm text-slate-400">
            Chrome perlu izin popup dan lokasi agar ekstensi Gaetin bisa bekerja dengan optimal di Google Maps.
          </p>
        </div>
      </div>

      {/* Permission cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Popup permission */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/ text-primary">
              <Monitor className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Izin Popup</p>
              <p className="text-xs text-slate-500">Pop-up dan pengalihan</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              "Buka Google Maps di Chrome",
              "Klik ikon 🔒 di address bar",
              "Pilih \"Izin situs\"",
              "\"Pop-up & pengalihan\" → Izinkan",
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="mt-0.5 shrink-0 font-bold text-primary">{i + 1}.</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location permission */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Izin Lokasi</p>
              <p className="text-xs text-slate-500">Akses GPS / Geolocation</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              "Buka Google Maps di Chrome",
              "Klik ikon 🔒 di address bar",
              "Pilih \"Izin situs\"",
              "\"Lokasi\" → Izinkan",
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="mt-0.5 shrink-0 font-bold text-emerald-400">{i + 1}.</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alternative via Chrome settings */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
        <p className="font-semibold">Alternatif via Chrome Settings:</p>
        <p className="mt-1 text-xs leading-5 text-amber-300/80">
          Buka <code className="rounded bg-black/20 px-1">chrome://settings/content</code> → Izin Situs → Pop-up & Lokasi → Tambahkan maps.google.com
        </p>
      </div>

      {/* Checklist */}
      <div className="space-y-2.5 border-t border-white/[0.06] pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Konfirmasi</p>
        {[
          "Izin Pop-up sudah diaktifkan untuk maps.google.com",
          "Izin Lokasi sudah diaktifkan untuk maps.google.com",
        ].map((label, i) => (
          <label key={i} className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 transition hover:bg-white/[0.04]">
            <div
              onClick={() => onCheck(i)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                checked?.[i]
                  ? "border-primary bg-primary text-white"
                  : "border-white/20 bg-transparent"
              }`}
            >
              {checked?.[i] && <Check className="h-3 w-3" />}
            </div>
            <span className={`text-sm ${checked?.[i] ? "text-white" : "text-slate-400"}`}>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Step 4: Ready!                                                 */
/* ────────────────────────────────────────────────────────────── */

function StepReady() {
  return (
    <div className="space-y-6">
      <div className="py-4 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary ring-4 ring-primary/10">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Setup Selesai!</h2>
        <p className="mt-2 text-slate-400">
          Semua konfigurasi siap. Saatnya menjalankan scraping pertamamu dari Google Maps.
        </p>
      </div>

      {/* Quick guide */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <p className="mb-4 text-sm font-bold text-white">Cara menjalankan scraping:</p>
        <div className="space-y-3">
          {[
            { step: "1", text: "Klik menu Scraper di sidebar kiri" },
            { step: "2", text: "Klik \"Buat Job Baru\" dan isi kata kunci & lokasi" },
            { step: "3", text: "Klik \"Mulai\" — lalu buka Google Maps" },
            { step: "4", text: "Ekstensi akan scrape otomatis dan data masuk ke dashboard" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-black text-primary">
                {item.step}
              </span>
              <p className="text-sm text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { icon: "💡", title: "Tips Kata Kunci", body: "Gunakan nama kategori bisnis + kota. Contoh: \"toko baju surabaya\", \"salon kecantikan bandung\"" },
          { icon: "⚡", title: "Radius Optimal", body: "Mulai dengan radius 5km untuk hasil yang lebih akurat. Perbesar area jika butuh lebih banyak lead." },
        ].map((tip) => (
          <div key={tip.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="mb-1 text-lg">{tip.icon}</p>
            <p className="text-sm font-bold text-white">{tip.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">{tip.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

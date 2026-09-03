"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Chrome,
  Download,
  ExternalLink,
  Mail,
  Map,
  MapPin,
  Monitor,
  Search,
  Send,
  Shield,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import WhatsAppAccounts from "@/components/dashboard/whatsapp-accounts";

const STEPS = [
  {
    id: 1,
    icon: Chrome,
    title: "Install Ekstensi Chrome",
    subtitle: "Download & aktifkan ekstensi Hellens",
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
    icon: Smartphone,
    title: "Sambung WhatsApp",
    subtitle: "Hubungkan nomor pengirim",
  },
  {
    id: 5,
    icon: Search,
    title: "Scraping Pertama",
    subtitle: "Jalankan job pertamamu",
  },
  {
    id: 6,
    icon: Zap,
    title: "Selesai!",
    subtitle: "Siap outreach",
  },
];

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [checked, setChecked] = useState<Record<number, boolean[]>>({
    1: [false, false, false],
    2: [false, false, false],
    3: [false, false],
    4: [],
    5: [],
    6: [],
  });

  // Deep-link support (?step=N) — dipakai checklist onboarding di dashboard home.
  // Baca langsung dari window.location sekali saat mount, bukan useSearchParams(),
  // supaya halaman ini tidak perlu dibungkus <Suspense> hanya untuk satu kali baca.
  useEffect(() => {
    const raw = Number(new URLSearchParams(window.location.search).get("step"));
    if (raw >= 1 && raw <= STEPS.length) setStep(raw);
  }, []);

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
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium tracking-wide text-foreground">
          <Sparkles className="h-3 w-3" />
          Panduan Setup
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Setup Ekstensi Hellens
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ikuti {STEPS.length} langkah ini dari install ekstensi sampai siap kirim WhatsApp/email pertamamu.
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
                    className={`flex h-10 w-10 items-center justify-center border-2 transition ${ isDone ?"border-primary bg-primary text-foreground"
                        : isActive
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border bg-muted/50 text-muted-foreground"
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
                      isActive ? "text-foreground" : isDone ? "text-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {s.subtitle}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px flex-1 max-w-8 mx-1 ${
                      s.id < step ? "bg-primary" : "bg-foreground/10"
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
        {step === 4 && <StepWhatsApp />}
        {step === 5 && <StepFirstScrape />}
        {step === 6 && <StepDone />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {step > 1 ? (
          <button
            onClick={() => setStep((p) => p - 1)}
            className="flex h-10 items-center gap-2 border border-border px-5 text-sm font-semibold text-foreground/80 transition hover:border-border hover:text-foreground"
          >
            ← Kembali
          </button>
        ) : (
          <div />
        )}

        {step < STEPS.length ? (
          <button
            onClick={() => setStep((p) => p + 1)}
            className="flex h-10 items-center gap-2 bg-primary px-6 text-sm font-bold text-foreground transition hover:bg-primary/90"
          >
            {allChecked(step) ? "Lanjut" : "Lewati"}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="flex h-10 items-center gap-2 bg-primary px-6 text-sm font-bold text-foreground transition hover:bg-primary/90"
          >
            Ke Dashboard
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
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-foreground">
          <Chrome className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Install Ekstensi Chrome</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ekstensi ini yang akan berjalan di browser kamu dan melakukan scraping otomatis dari Google Maps.
          </p>
        </div>
      </div>

      {/* Download card */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-foreground">Ekstensi Hellens untuk Chrome</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Versi terbaru · Kompatibel dengan Chrome 100+</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/extension.zip"
              download
              className="flex h-10 shrink-0 items-center gap-2 bg-primary px-5 text-sm font-bold text-foreground transition hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Download .ZIP
            </a>
          </div>
        </div>
      </div>

      {/* Install instructions */}
      <div>
        <p className="mb-3 text-sm font-semibold text-foreground/80">Cara Install:</p>

        <div className="rounded-xl border border-primary/20 bg-card p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground">File .ZIP & Load Unpacked</p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p><strong className="text-foreground">1.</strong> Download file <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">extension.zip</code> lalu **extract/unzip** menjadi folder.</p>
            <p><strong className="text-foreground">2.</strong> Buka Chrome → ketik <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">chrome://extensions</code> → aktifkan **Mode pengembang** (kanan atas).</p>
            <p><strong className="text-foreground">3.</strong> Klik tombol **"Load unpacked"** (Muat yang dibongkar) → pilih **folder hasil extract** tadi.</p>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2.5 border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Konfirmasi</p>
        {[
          "Sudah download file ekstensi",
          "Sudah mengaktifkan Mode Pengembang di Chrome",
          "Ikon Hellens sudah muncul di toolbar Chrome",
        ].map((label, i) => (
          <label key={i} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 transition hover:bg-card">
            <div
              onClick={() => onCheck(i)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                checked?.[i]
                  ? "border-primary bg-primary text-foreground"
                  : "border-border bg-transparent"
              }`}
            >
              {checked?.[i] && <Check className="h-3 w-3" />}
            </div>
            <span className={`text-sm ${checked?.[i] ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
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
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-warning/15 text-warning">
          <Map className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Konfigurasi Google Maps</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ada satu pengaturan wajib di Google Maps yang <strong className="text-foreground">harus</strong> diaktifkan agar scraping berjalan.
          </p>
        </div>
      </div>

      {/* Visual mockup */}
      <div className="overflow-hidden rounded-2xl border border-border bg-muted">
        {/* Maps top bar */}
        <div className="flex items-center gap-3 border-b border-border bg-muted px-4 py-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/">
            <MapPin className="h-3.5 w-3.5 text-foreground" />
          </div>
          <div className="flex-1 border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground">
            kafe jakarta pusat
          </div>
          <span className="text-[10px] text-muted-foreground">× 📍</span>
        </div>

        {/* Results panel */}
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground/80">Hasil · 50+</p>
            <span className="text-[10px] text-muted-foreground">ℹ</span>
          </div>

          {/* THE CHECKBOX — highlighted */}
          <div className="mb-4 rounded-xl border-2 border-destructive/60 bg-destructive/5 px-3 py-2.5 shadow-[0_0_18px_rgba(239,68,68,0.25)]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-primary/50 bg-primary/">
                <Check className="h-2.5 w-2.5 text-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Perbarui hasil saat peta digeser
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-destructive">
                Wajib aktif!
              </span>
              <span className="text-[10px] text-muted-foreground">Tanpa ini scraping tidak bisa berjalan</span>
            </div>
          </div>

          {/* Sample results */}
          <div className="space-y-1.5">
            {["Kopi Nako · ★4.8", "Escobar Coffee · ★4.7", "Filosofi Kopi · ★4.6"].map((item) => (
              <div key={item} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
                <div className="h-8 w-8 rounded-lg bg-muted" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div>
        <p className="mb-3 text-sm font-semibold text-foreground/80">Langkah-langkah:</p>
        <div className="space-y-2.5">
          {[
            { text: "Buka maps.google.com di browser Chrome", action: null },
            { text: "Ketik kata kunci bisnis yang ingin kamu scrape", action: "Contoh: \"kafe jakarta\", \"salon bandung\"" },
            { text: "Centang kotak \"Perbarui hasil saat peta digeser\"", action: "Ada di bagian atas daftar hasil pencarian" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning/20 text-[10px] font-black text-warning">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{item.text}</p>
                {item.action && <p className="mt-0.5 text-xs text-muted-foreground">{item.action}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <a
        href="https://maps.google.com"
        target="_blank"
        rel="noreferrer"
        className="flex h-10 w-full items-center justify-center gap-2 border border-border text-sm font-semibold text-foreground/80 transition hover:border-primary/30 hover:text-foreground"
      >
        <ExternalLink className="h-4 w-4" />
        Buka Google Maps
      </a>

      {/* Checklist */}
      <div className="space-y-2.5 border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Konfirmasi</p>
        {[
          "Sudah membuka Google Maps di Chrome",
          "Sudah mencari kata kunci bisnis",
          "Kotak \"Perbarui hasil saat peta digeser\" sudah dicentang",
        ].map((label, i) => (
          <label key={i} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 transition hover:bg-card">
            <div
              onClick={() => onCheck(i)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                checked?.[i]
                  ? "border-primary bg-primary text-foreground"
                  : "border-border bg-transparent"
              }`}
            >
              {checked?.[i] && <Check className="h-3 w-3" />}
            </div>
            <span className={`text-sm ${checked?.[i] ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
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
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Aktifkan Izin Browser</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Chrome perlu izin popup dan lokasi agar ekstensi Hellens bisa bekerja dengan optimal di Google Maps.
          </p>
        </div>
      </div>

      {/* Permission cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Popup permission */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/ text-foreground">
              <Monitor className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Izin Popup</p>
              <p className="text-xs text-muted-foreground">Pop-up dan pengalihan</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              "Buka Google Maps di Chrome",
              "Klik ikon 🔒 di address bar",
              "Pilih \"Izin situs\"",
              "\"Pop-up & pengalihan\" → Izinkan",
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 shrink-0 font-bold text-foreground">{i + 1}.</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Location permission */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-success/15 text-success">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Izin Lokasi</p>
              <p className="text-xs text-muted-foreground">Akses GPS / Geolocation</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              "Buka Google Maps di Chrome",
              "Klik ikon 🔒 di address bar",
              "Pilih \"Izin situs\"",
              "\"Lokasi\" → Izinkan",
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 shrink-0 font-bold text-success">{i + 1}.</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alternative via Chrome settings */}
      <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 text-sm text-warning">
        <p className="font-semibold">Alternatif via Chrome Settings:</p>
        <p className="mt-1 text-xs leading-5 text-warning/80">
          Buka <code className="rounded bg-black/20 px-1">chrome://settings/content</code> → Izin Situs → Pop-up & Lokasi → Tambahkan maps.google.com
        </p>
      </div>

      {/* Checklist */}
      <div className="space-y-2.5 border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Konfirmasi</p>
        {[
          "Izin Pop-up sudah diaktifkan untuk maps.google.com",
          "Izin Lokasi sudah diaktifkan untuk maps.google.com",
        ].map((label, i) => (
          <label key={i} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 transition hover:bg-card">
            <div
              onClick={() => onCheck(i)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                checked?.[i]
                  ? "border-primary bg-primary text-foreground"
                  : "border-border bg-transparent"
              }`}
            >
              {checked?.[i] && <Check className="h-3 w-3" />}
            </div>
            <span className={`text-sm ${checked?.[i] ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Step 4: Sambung WhatsApp                                       */
/* ────────────────────────────────────────────────────────────── */

function StepWhatsApp() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-success/15 text-success">
          <Smartphone className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Sambungkan Nomor WhatsApp</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Scan QR dengan WhatsApp di ponselmu. Nomor ini yang akan mengirim Blast, Kampanye, dan Follow-up nanti.
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <WhatsAppAccounts />
      </div>
      <p className="text-xs text-muted-foreground">
        Belum siap sambung nomor sekarang? Boleh dilewati dulu — bisa disambungkan kapan saja lewat menu{" "}
        <Link href="/dashboard/settings" className="text-foreground hover:underline">Pengaturan</Link>.
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Step 5: Scraping Pertama                                       */
/* ────────────────────────────────────────────────────────────── */

function StepFirstScrape() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-foreground">
          <Search className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Jalankan Scraping Pertamamu</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Semua sudah siap. Buka menu Scraper untuk mulai mengambil lead dari Google Maps.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <p className="mb-4 text-sm font-bold text-foreground">Cara menjalankan scraping:</p>
        <div className="space-y-3">
          {[
            { step: "1", text: "Klik menu Scraper di sidebar kiri" },
            { step: "2", text: "Klik \"Buat Job Baru\" dan isi kata kunci & lokasi" },
            { step: "3", text: "Klik \"Mulai\" — lalu buka Google Maps" },
            { step: "4", text: "Ekstensi akan scrape otomatis dan data masuk ke dashboard" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-black text-foreground">
                {item.step}
              </span>
              <p className="text-sm text-foreground/80">{item.text}</p>
            </div>
          ))}
        </div>
        <Link
          href="/dashboard/scraper"
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          Buka Scraper
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Tips */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { icon: "💡", title: "Tips Kata Kunci", body: "Gunakan nama kategori bisnis + kota. Contoh: \"toko baju surabaya\", \"salon kecantikan bandung\"" },
          { icon: "⚡", title: "Radius Optimal", body: "Mulai dengan radius 5km untuk hasil yang lebih akurat. Perbesar area jika butuh lebih banyak lead." },
        ].map((tip) => (
          <div key={tip.title} className="rounded-xl border border-border bg-card p-4">
            <p className="mb-1 text-lg">{tip.icon}</p>
            <p className="text-sm font-bold text-foreground">{tip.title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{tip.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Step 6: Selesai!                                                */
/* ────────────────────────────────────────────────────────────── */

function StepDone() {
  const nextActions = [
    { href: "/dashboard/scraper", label: "Scraper", desc: "Ambil lead baru dari Google Maps", icon: Search },
    { href: "/dashboard/email-finder", label: "Cari Email", desc: "Temukan email dari website lead", icon: Mail },
    { href: "/dashboard/blast", label: "WhatsApp Blast", desc: "Kirim pesan ke kontak tersimpan", icon: Send },
  ];
  return (
    <div className="space-y-6">
      <div className="py-4 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-foreground ring-4 ring-primary/10">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Setup Selesai!</h2>
        <p className="mt-2 text-muted-foreground">
          Ekstensi terpasang, WhatsApp tersambung. Mau lanjut ke mana dulu?
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {nextActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-2xl border border-border bg-card p-4 transition hover:border-primary/30 hover:bg-primary/5"
          >
            <action.icon className="h-5 w-5 text-foreground" />
            <p className="mt-2 text-sm font-bold text-foreground">{action.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{action.desc}</p>
            <span className="mt-2 flex items-center gap-1 text-xs font-semibold text-foreground opacity-0 transition group-hover:opacity-100">
              Buka <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

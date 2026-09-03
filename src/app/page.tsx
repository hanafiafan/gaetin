import Link from "next/link";
import LandingConversionPanel from "@/components/landing-conversion-panel";
import LandingFaq from "@/components/landing-faq";
import ArrowButton from "@/components/brand/arrow-button";
import StatRow from "@/components/brand/stat-row";
import {
  ArrowUpRight,
  Check,
  ClipboardCheck,
  Database,
  LineChart,
  MessageSquareText,
  Search,
  ShieldCheck,
  Users,
  Zap,
  Chrome,
  Cpu,
  DownloadCloud,
  MapPin,
  X,
  Map,
  Shield,
} from "lucide-react";

const navItems = [
  { label: "Fitur", href: "#fitur" },
  { label: "Cara Kerja", href: "#setup" },
  { label: "Simulasi", href: "#simulasi" },
  { label: "Harga", href: "#harga" },
];

const heroStats = [
  { label: "Prospek ditemukan", value: "15K+" },
  { label: "Kontak tersimpan", value: "84K" },
  { label: "Pesan follow-up", value: "32K" },
];

const trustFeatures = [
  { icon: Chrome, label: "Ekstensi Chrome gratis" },
  { icon: MapPin, label: "Google Maps terintegrasi" },
  { icon: Users, label: "Multi-anggota tim" },
  { icon: Cpu, label: "WhatsApp multi-nomor" },
  { icon: DownloadCloud, label: "Ekspor CSV & Excel" },
  { icon: Zap, label: "100 kredit trial gratis" },
];

const features = [
  {
    icon: Search,
    title: "Scraping Calon Customer",
    description: "Ekstensi Chrome terintegrasi langsung dengan Google Maps. Atur kata kunci, area, dan jumlah hasil — data tersimpan real-time ke dashboard.",
    badge: null,
    fill: "yellow" as const,
  },
  {
    icon: MessageSquareText,
    title: "Pusat Pesan WhatsApp",
    description: "Inbox, blast, follow-up, template, dan validasi kontak tersusun dalam satu alur agar tim tidak perlu berpindah menu.",
    badge: "Bisnis+",
    fill: "plain" as const,
  },
  {
    icon: ClipboardCheck,
    title: "CRM & Tindak Lanjut",
    description: "Pantau prospek, jadwal balasan, status deal, dan tugas tim agar tidak ada peluang yang terlewat.",
    badge: "Bisnis+",
    fill: "black" as const,
  },
  {
    icon: Database,
    title: "Database Prospek",
    description: "Kontak, lead, deal, percakapan, dan aktivitas tersimpan rapi dan bisa difilter kapan saja.",
    badge: "Bisnis+",
    fill: "black" as const,
  },
  {
    icon: LineChart,
    title: "Laporan Operasional",
    description: "Pantau performa broadcast, konversi CRM, tagihan, dan aktivitas workspace secara real-time.",
    badge: "Bisnis+",
    fill: "plain" as const,
  },
  {
    icon: ShieldCheck,
    title: "Kontrol Profesional",
    description: "Peran pengguna, batas pemakaian, tagihan, audit, dan konfigurasi workspace disiapkan untuk operasional yang rapi.",
    badge: "Bisnis+",
    fill: "yellow" as const,
  },
];

const setupSteps = [
  {
    icon: Chrome,
    step: "01",
    title: "Install Ekstensi",
    description: "Download ekstensi Hellens untuk Chrome. Install dalam 30 detik, tidak perlu coding.",
  },
  {
    icon: Map,
    step: "02",
    title: "Aktifkan Fitur Maps",
    description: "Buka Google Maps, centang \"Perbarui hasil saat peta digeser\" — satu langkah krusial.",
    highlight: true,
  },
  {
    icon: Shield,
    step: "03",
    title: "Izinkan Popup & Lokasi",
    description: "Aktifkan izin popup dan lokasi di Chrome untuk maps.google.com.",
  },
  {
    icon: Zap,
    step: "04",
    title: "Mulai Scraping",
    description: "Buat job scraping, buka Google Maps, dan lead langsung masuk ke dashboard secara real-time.",
  },
];

const pricingPlans = [
  {
    name: "Trial Gratis",
    price: "Gratis",
    priceNote: "selamanya",
    description: "Coba scraping Google Maps dan ekspor hasilnya. Tidak perlu kartu kredit.",
    badge: null,
    highlighted: false,
    cta: "Mulai Trial Gratis",
    ctaHref: "/register",
    features: [
      { label: "100 kredit awal", included: true },
      { label: "Scraping Google Maps", included: true },
      { label: "Ekspor CSV & Excel", included: true },
      { label: "20 scraper jobs/bulan", included: true },
      { label: "WhatsApp Integration", included: false },
      { label: "CRM & Follow-up", included: false },
      { label: "Blast & Campaign", included: false },
      { label: "Inbox & Percakapan", included: false },
    ],
  },
  {
    name: "Bisnis",
    price: "Rp199K",
    priceNote: "/bulan",
    description: "Fitur lengkap untuk operasional WhatsApp marketing dan CRM aktif.",
    badge: "Paling Populer",
    highlighted: true,
    cta: "Pilih Paket Bisnis",
    ctaHref: "/register",
    features: [
      { label: "2.000 kredit/bulan", included: true },
      { label: "Scraping Google Maps", included: true },
      { label: "Ekspor CSV & Excel", included: true },
      { label: "WhatsApp multi-nomor", included: true },
      { label: "CRM & Follow-up otomatis", included: true },
      { label: "Blast & Campaign", included: true },
      { label: "Inbox & Percakapan", included: true },
      { label: "Validasi Nomor WA", included: true },
    ],
  },
  {
    name: "Pro",
    price: "Rp499K",
    priceNote: "/bulan",
    description: "Untuk tim besar, agency, atau reseller dengan volume tinggi dan kebutuhan white-label.",
    badge: null,
    highlighted: false,
    cta: "Pilih Paket Pro",
    ctaHref: "/register",
    features: [
      { label: "6.000 kredit/bulan", included: true },
      { label: "Radius scraping 20km", included: true },
      { label: "1.500 lead per job", included: true },
      { label: "Semua fitur Bisnis", included: true },
      { label: "White-label & Branding", included: true },
      { label: "Support Prioritas VIP", included: true },
      { label: "1.000 scraper jobs/bulan", included: true },
      { label: "Akses API (segera hadir)", included: true },
    ],
  },
];

const testimonials = [
  {
    quote: "Dalam 10 menit setup, saya sudah bisa scraping 200+ lead kafe di Jakarta. Datanya langsung masuk dashboard dan siap di-blast lewat WhatsApp.",
    name: "Nadia Putri",
    role: "Founder, Local Beauty Brand",
    photo: "/media/testimonial-nadia.jpg",
  },
  {
    quote: "Yang paling saya suka adalah alurnya: scrape → validasi → blast dalam satu sistem. Tidak perlu pindah-pindah tools lagi.",
    name: "Rizky Ananda",
    role: "Sales Manager",
    photo: "/media/testimonial-rizky.jpg",
  },
  {
    quote: "500 lead dari Google Maps selesai scraping dalam 15 menit. Langsung tersusun di CRM dan siap di-assign ke tim sales.",
    name: "Dimas Pratama",
    role: "Koordinator Penjualan",
    photo: "/media/testimonial-dimas.jpg",
  },
];

const footerLinks = {
  Produk: [
    { label: "Fitur", href: "#fitur" },
    { label: "Cara Kerja", href: "#setup" },
    { label: "Simulasi", href: "#simulasi" },
    { label: "Harga", href: "#harga" },
  ],
  Platform: [
    { label: "Masuk", href: "/login" },
    { label: "Daftar Gratis", href: "/register" },
    { label: "Blog", href: "/blog" },
  ],
  Bantuan: [
    { label: "FAQ", href: "#faq" },
    { label: "Privasi", href: "#" },
    { label: "Syarat Layanan", href: "#" },
  ],
};

/* Wireframe globe — the reference's line-drawn sphere, hand-built so the hero
   needs no image asset. */
function WireGlobe({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none">
      <circle cx="100" cy="100" r="78" stroke="currentColor" strokeWidth="1" />
      {[-52, -26, 0, 26, 52].map((dy) => (
        <ellipse key={dy} cx="100" cy={100 + dy} rx={Math.sqrt(Math.max(78 * 78 - dy * dy, 0))} ry="7" stroke="currentColor" strokeWidth="0.75" />
      ))}
      {[16, 34, 56, 78].map((rx) => (
        <ellipse key={rx} cx="100" cy="100" rx={rx} ry="78" stroke="currentColor" strokeWidth="0.75" />
      ))}
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="cg-shell min-h-screen">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="landing-header sticky top-0 border-b border-foreground bg-background">
        <nav className="cg-section flex items-center justify-between gap-4 py-4">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <img src="/brand/hellens-mark-black.png" alt="" className="h-7 w-7" />
            <span className="cg-display text-2xl">Hellens</span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="cg-label text-foreground transition hover:text-muted-foreground">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="cg-label hidden text-foreground transition hover:text-muted-foreground sm:block">
              Masuk
            </Link>
            <ArrowButton href="/register" label="Mulai gratis" variant="yellow" size="sm" />
          </div>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="cg-section pb-10 pt-12 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="min-w-0">
            <span className="cg-kicker">Google Maps · WhatsApp · CRM</span>

            {/* Sized to fit the column: the longest line ("dari Google Maps,")
                overflowed into the artwork at the previous 9vw / 7rem. */}
            <h1 className="cg-display mt-6 text-[clamp(2.5rem,6.4vw,5.25rem)]">
              Ribuan prospek
              <br />
              dari Google Maps,
              <br />
              <span className="cg-highlight">siap dihubungi.</span>
            </h1>

            <p className="mt-8 max-w-md text-sm leading-7 text-muted-foreground">
              Hellens mengekstrak data bisnis dari Google Maps lewat ekstensi Chrome, merapikan
              kontak, mengirim WhatsApp, dan mengelola follow-up dari satu dashboard.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/register" className="group inline-flex items-center gap-3">
                <span className="cg-label border-b-2 border-primary pb-1">Coba scraping gratis</span>
                <ArrowButton label="Coba scraping gratis" variant="black" size="sm" decorative />
              </Link>
              <Link href="#setup" className="cg-label text-muted-foreground transition hover:text-foreground">
                Lihat cara kerja
              </Link>
            </div>

            <p className="cg-label mt-8 text-muted-foreground">
              Trial gratis · 100 kredit · Tanpa kartu kredit
            </p>
          </div>

          {/* Right column: wireframe globe as line art, the 3D form on top,
              rotating badge and section counter as the reference's punctuation. */}
          <div className="relative hidden aspect-square lg:block">
            <WireGlobe className="absolute right-0 top-0 h-3/4 w-3/4 text-border" />

            <img
              src="/media/hero-form.webp"
              alt=""
              className="absolute left-0 top-[6%] h-[88%] w-full object-contain"
            />

            {/* Rotating badge sits above the form, arrow fixed at its centre */}
            <div className="absolute -bottom-4 -left-8 z-10 h-32 w-32">
              <svg viewBox="0 0 120 120" className="cg-spin h-full w-full">
                <defs>
                  <path id="badge-arc" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
                </defs>
                <circle cx="60" cy="60" r="58" fill="hsl(var(--primary))" />
                <text className="fill-foreground text-[11px] font-bold uppercase" style={{ letterSpacing: "0.24em" }}>
                  <textPath href="#badge-arc" startOffset="0%">
                    Scrape · Kirim · Closing ·
                  </textPath>
                </text>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center">
                <ArrowUpRight className="h-7 w-7" strokeWidth={2.5} />
              </span>
            </div>

            <div className="absolute right-0 top-4 z-10 flex flex-col items-end gap-2">
              <span className="cg-display text-3xl">01</span>
              <span className="h-12 w-px bg-border" />
              <span className="cg-display text-3xl text-border">05</span>
            </div>
          </div>
        </div>

        <StatRow stats={heroStats} className="mt-14 border-t border-foreground" />
      </section>

      {/* ── Trust bar ───────────────────────────────────────────────────── */}
      <section className="cg-section">
        <div className="grid grid-cols-2 border-y border-border sm:grid-cols-3 lg:grid-cols-6">
          {trustFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <span
                key={item.label}
                className="cg-label flex items-center gap-2 border-l border-border px-4 py-5 text-muted-foreground first:border-l-0 first:pl-0"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {item.label}
              </span>
            );
          })}
        </div>
      </section>

      {/* ── Value band — inverted, so the B&W photo carries it ──────────── */}
      <section className="cg-invert">
        <div className="cg-section py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-center lg:gap-14">
            {/* Photo with a yellow bar breaking its edge, per the reference */}
            <div className="relative hidden lg:block">
              <img
                src="/media/value-band.jpg"
                alt="Pemilik bisnis mengelola prospek dari dashboard Hellens"
                className="aspect-[4/5] w-full object-cover grayscale"
                loading="lazy"
              />
              <span className="absolute -right-7 top-1/2 h-12 w-32 bg-primary" />
            </div>

            <div className="min-w-0">
              <h2 className="cg-display text-[clamp(2.25rem,5.4vw,4.25rem)]">
                Dari menemukan prospek
                <br />
                sampai <span className="cg-highlight">jadi pelanggan.</span>
              </h2>
              <div className="mt-10 grid gap-8 border-t border-border pt-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <p className="max-w-md text-sm leading-7 text-muted-foreground">
                  Trial gratis memberi akses ke scraping &amp; ekspor. Upgrade untuk membuka
                  WhatsApp marketing, CRM, dan seluruh fitur otomasi.
                </p>
                <Link
                  href="#fitur"
                  className="cg-label inline-flex shrink-0 items-center gap-2 bg-primary px-5 py-3.5 text-primary-foreground transition hover:bg-background hover:text-foreground"
                >
                  Lihat semua fitur
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="fitur" className="cg-section py-20">
        <div className="flex items-center justify-between gap-4 border-b border-foreground pb-4">
          <h2 className="cg-display flex items-center gap-3 text-3xl sm:text-4xl">
            Fitur <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          </h2>
          <Link href="/register" className="cg-label hidden items-center gap-2 text-foreground transition hover:text-muted-foreground sm:flex">
            Mulai gratis
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            const skin =
              feature.fill === "yellow"
                ? "bg-primary text-primary-foreground"
                : feature.fill === "black"
                  ? "bg-foreground text-background"
                  : "bg-background text-foreground";
            const meta = feature.fill === "plain" ? "text-muted-foreground" : "opacity-70";

            return (
              <article
                key={feature.title}
                className={`group relative flex min-h-[300px] flex-col justify-between border-b border-r border-border p-7 ${skin}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <Icon className="h-7 w-7" strokeWidth={1.75} />
                  {feature.badge && <span className={`cg-label ${meta}`}>{feature.badge}</span>}
                </div>
                <div>
                  <h3 className="cg-display text-2xl">{feature.title}</h3>
                  <p className={`mt-3 text-sm leading-6 ${meta}`}>{feature.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Setup steps — tinted band ───────────────────────────────────── */}
      <section id="setup" className="cg-tint">
        <div className="cg-section py-20 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 className="cg-display text-[clamp(2.25rem,6vw,4.5rem)]">
            Install sampai
            <br />
            scraping: <span className="cg-highlight">10 menit.</span>
          </h2>
          <p className="max-w-md text-sm leading-7 text-muted-foreground lg:pb-3">
            Tidak perlu coding. Ikuti 4 langkah ini dan kamu langsung bisa mulai scraping ribuan
            data bisnis dari Google Maps.
          </p>
        </div>

        <div className="mt-14 border-t border-foreground">
          {setupSteps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="grid items-start gap-4 border-b border-border py-8 sm:grid-cols-[auto_1fr_auto] sm:gap-8"
              >
                <span className="cg-display w-24 text-5xl text-border sm:text-6xl">{s.step}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="cg-display text-2xl">{s.title}</h3>
                    {s.highlight && <span className="cg-highlight cg-label">Krusial</span>}
                  </div>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">{s.description}</p>
                </div>
                <Icon className="hidden h-6 w-6 text-muted-foreground sm:block" strokeWidth={1.75} />
              </div>
            );
          })}
        </div>

        {/* The critical Google Maps checkbox */}
        <div className="mt-12 grid gap-0 border border-foreground lg:grid-cols-2">
          <div className="border-b border-foreground p-8 lg:border-b-0 lg:border-r lg:p-10">
            <span className="cg-kicker">Langkah krusial #2</span>
            <h3 className="cg-display mt-5 text-3xl">Centang kotak ini di Google Maps</h3>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Setelah cari kata kunci bisnis di Google Maps, pastikan kotak{" "}
              <strong className="font-bold text-foreground">
                &ldquo;Perbarui hasil saat peta digeser&rdquo;
              </strong>{" "}
              sudah dicentang. Ini yang membuat ekstensi bisa mengambil data saat kamu menggeser peta.
            </p>
            <p className="cg-label mt-6 border-l-2 border-destructive pl-3 text-destructive">
              Tanpa kotak ini, ekstensi tidak bisa scraping otomatis
            </p>
            <Link
              href="/register"
              className="cg-label mt-7 inline-flex items-center gap-2 bg-foreground px-5 py-3.5 text-background transition hover:bg-primary hover:text-primary-foreground"
            >
              <DownloadCloud className="h-4 w-4" />
              Mulai trial &amp; ikuti panduan
            </Link>
          </div>

          {/* Google Maps mockup */}
          <div className="bg-muted p-6 sm:p-8">
            <div className="border border-border bg-background">
              <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
                <MapPin className="h-3.5 w-3.5 text-foreground" />
                <span className="flex-1 text-xs text-muted-foreground">kafe jakarta pusat</span>
                <X className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="cg-label text-muted-foreground">Hasil · 50+</span>
              </div>
              <div className="m-3 border-2 border-destructive bg-destructive/5 px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                  </span>
                  <span className="text-xs font-bold text-foreground">Perbarui hasil saat peta digeser</span>
                </div>
                <p className="cg-label mt-2 text-destructive">↑ Wajib dicentang</p>
              </div>
              <div className="px-3 pb-3">
                {["Kopi Nako · ★4.8 · Tanah Abang", "Escobar Coffee · ★4.7 · Menteng", "Filosofi Kopi · ★4.6 · Kemang"].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 border-t border-border py-2.5">
                    <span className="h-8 w-8 shrink-0 bg-muted" />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ── Simulation ──────────────────────────────────────────────────── */}
      <section id="simulasi" className="cg-section py-20">
        <div className="grid gap-8 border-b border-foreground pb-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 className="cg-display text-[clamp(2.25rem,6vw,4.5rem)]">
            Lihat potensinya
            <br />
            <span className="cg-highlight">sebelum daftar.</span>
          </h2>
          <p className="max-w-md text-sm leading-7 text-muted-foreground lg:pb-3">
            Simulasikan berapa kontak, balasan, follow-up, dan deal yang bisa kamu hasilkan dengan
            Hellens.
          </p>
        </div>
        <div className="mt-10">
          <LandingConversionPanel />
        </div>
      </section>

      {/* ── Pricing — inverted, featured tier in yellow ─────────────────── */}
      <section id="harga" className="cg-invert">
        <div className="cg-section py-20 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 className="cg-display text-[clamp(2.25rem,6vw,4.5rem)]">
            Mulai gratis.
            <br />
            <span className="cg-highlight">Upgrade nanti.</span>
          </h2>
          <p className="max-w-md text-sm leading-7 text-muted-foreground lg:pb-3">
            Trial gratis memberi akses ke Google Maps scraping dan ekspor data. Upgrade ke Bisnis
            untuk membuka WhatsApp, CRM, blast, dan seluruh fitur pemasaran.
          </p>
        </div>

        <div className="mt-14 grid border-t border-foreground lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article
              key={plan.name}
              className={`flex flex-col border-b border-r border-border p-8 ${
                plan.highlighted ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="cg-display text-3xl">{plan.name}</h3>
                {plan.badge && <span className="cg-label bg-primary-foreground px-2 py-1 text-primary">{plan.badge}</span>}
              </div>

              <div className="mt-6 flex items-end gap-2">
                <span className="cg-display text-5xl">{plan.price}</span>
                <span className={`cg-label pb-2 ${plan.highlighted ? "opacity-60" : "text-muted-foreground"}`}>
                  {plan.priceNote}
                </span>
              </div>

              <p className={`mt-4 text-sm leading-6 ${plan.highlighted ? "opacity-70" : "text-muted-foreground"}`}>
                {plan.description}
              </p>

              <Link
                href={plan.ctaHref}
                className={`cg-label mt-7 flex items-center justify-between gap-2 px-5 py-4 transition ${
                  plan.highlighted
                    ? "bg-primary-foreground text-primary hover:bg-background hover:text-foreground"
                    : "bg-primary text-primary-foreground hover:bg-foreground hover:text-background"
                }`}
              >
                {plan.cta}
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>

              <div className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature.label} className="flex items-center gap-3 text-sm">
                    {feature.included ? (
                      <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
                    ) : (
                      <X className={`h-4 w-4 shrink-0 ${plan.highlighted ? "opacity-40" : "text-border"}`} />
                    )}
                    <span
                      className={
                        feature.included
                          ? plan.highlighted
                            ? ""
                            : "text-foreground"
                          : plan.highlighted
                            ? "opacity-40"
                            : "text-muted-foreground"
                      }
                    >
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <p className="cg-label mt-8 text-muted-foreground">
          Harga belum termasuk PPN · Diskon 20% pembayaran tahunan · Trial tanpa kartu kredit
        </p>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" className="cg-section py-20">
        <div className="grid gap-10 lg:grid-cols-[380px_1fr] lg:items-start">
          <div>
            <span className="cg-kicker">Pertanyaan umum</span>
            <h2 className="cg-display mt-5 text-[clamp(2rem,4.5vw,3.5rem)]">
              Semua yang perlu diketahui.
            </h2>
            <p className="mt-5 max-w-xs text-sm leading-7 text-muted-foreground">
              Masih ada pertanyaan lain? Hubungi tim kami melalui halaman Bantuan di dalam
              dashboard.
            </p>
          </div>
          <LandingFaq />
        </div>
      </section>

      {/* ── Testimonials — inverted for the B&W portraits ───────────────── */}
      <section className="cg-invert">
        <div className="cg-section py-20 lg:py-24">
        <div className="flex items-center justify-between gap-4 border-b border-foreground pb-4">
          <h2 className="cg-display text-3xl sm:text-4xl">
            Testimoni <span className="text-primary">●</span>
          </h2>
          <span className="cg-label text-muted-foreground">03 Klien</span>
        </div>

        <div className="grid lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="flex flex-col justify-between border-b border-r border-border p-8">
              <p className="text-lg leading-8 text-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="mt-10 flex items-center gap-3">
                <img
                  src={testimonial.photo}
                  alt={testimonial.name}
                  className="h-14 w-14 shrink-0 object-cover grayscale"
                  loading="lazy"
                />
                <div>
                  <p className="cg-label">{testimonial.name}</p>
                  <p className="cg-label mt-1 text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        </div>
      </section>

      {/* ── Final CTA — full-bleed accent band ──────────────────────────── */}
      <section className="cg-accent">
        <div className="cg-section py-20 lg:py-24">
        <div className="grid lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col justify-between gap-10 py-2 pr-8 sm:pr-12">
            <h2 className="cg-display text-[clamp(2.5rem,7vw,5rem)]">
              Mulai scraping
              <br />
              sekarang — gratis.
            </h2>
            <div className="flex items-center gap-5">
              <ArrowButton href="/register" label="Daftar dan mulai scraping" variant="black" size="lg" />
              <span className="cg-label max-w-[14rem]">
                100 kredit trial · Tanpa kartu kredit · Setup 10 menit
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-8 border-l border-border pl-8 sm:pl-12">
            <div>
              <span className="cg-label text-muted-foreground">Sudah punya akun?</span>
              <Link href="/login" className="cg-display mt-3 flex items-center gap-3 text-3xl transition hover:opacity-70">
                Masuk
                <ArrowUpRight className="h-6 w-6" strokeWidth={2.5} />
              </Link>
            </div>
            <div className="cg-rule pt-6">
              <span className="cg-label text-muted-foreground">Butuh bantuan?</span>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Tim kami siap membantu setup ekstensi dan scraping pertamamu.
              </p>
            </div>
            <span className="cg-cross" />
          </div>
        </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-foreground text-background">
        <div className="cg-section py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <img src="/brand/hellens-mark-white.png" alt="" className="h-7 w-7" />
                <span className="cg-display text-2xl">Hellens</span>
              </Link>
              <p className="mt-5 max-w-xs text-sm leading-7 opacity-60">
                Platform scraping prospek Google Maps, WhatsApp marketing, dan CRM untuk bisnis
                Indonesia.
              </p>
              <Link
                href="/register"
                className="cg-label mt-7 inline-flex items-center gap-2 bg-primary px-5 py-3.5 text-primary-foreground transition hover:bg-background hover:text-foreground"
              >
                Mulai gratis
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
            </div>

            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <p className="cg-label opacity-50">{group}</p>
                <ul className="mt-5 space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm transition hover:text-primary">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col justify-between gap-3 border-t border-background/20 pt-8 sm:flex-row">
            <p className="cg-label opacity-50">
              &copy; {new Date().getFullYear()} Hellens. Semua hak dilindungi.
            </p>
            <p className="cg-label opacity-50">Midtrans · SSL terenkripsi</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

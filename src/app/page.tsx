import Link from "next/link";
import LandingConversionPanel from "@/components/landing-conversion-panel";
import LandingFaq from "@/components/landing-faq";
import {
  ArrowRight,
  Check,
  ChevronRight,
  ClipboardCheck,
  Database,
  Gauge,
  HelpCircle,
  LineChart,
  LockKeyhole,
  MessageSquareText,
  MousePointerClick,
  PlugZap,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  WalletCards,
  Workflow,
  Zap,
  Chrome,
  Cpu,
  DownloadCloud,
  MapPin,
} from "lucide-react";

const navItems = [
  { label: "Fitur", href: "#fitur" },
  { label: "Simulasi", href: "#simulasi" },
  { label: "Alur Kerja", href: "#workflow" },
  { label: "Harga", href: "#harga" },
];

const heroStats = [
  { label: "Prospek ditemukan", value: "15K+" },
  { label: "Kontak tersimpan", value: "84K" },
  { label: "Pesan follow-up", value: "32K" },
];

const quickBenefits = [
  { label: "Cari calon customer", href: "#fitur", icon: Search },
  { label: "Simulasi hasil", href: "#simulasi", icon: MousePointerClick },
  { label: "Lihat alur kerja", href: "#workflow", icon: Workflow },
];

const trustFeatures = [
  { icon: Chrome, label: "Ekstensi Chrome" },
  { icon: MapPin, label: "Google Maps terintegrasi" },
  { icon: Users, label: "Multi-anggota tim" },
  { icon: Cpu, label: "WhatsApp multi-nomor" },
  { icon: DownloadCloud, label: "Ekspor CSV" },
  { icon: Sparkles, label: "Trial 100 kredit gratis" },
];

const pipelineChart = {
  path: "M8 132 C48 106 72 114 104 90 C142 60 166 78 198 52 C232 24 266 40 304 18",
  area: "M8 132 C48 106 72 114 104 90 C142 60 166 78 198 52 C232 24 266 40 304 18 L304 156 L8 156 Z",
  points: [
    { x: 8, y: 132, label: "Scrape" },
    { x: 104, y: 90, label: "Valid" },
    { x: 198, y: 52, label: "Follow-up" },
    { x: 304, y: 18, label: "Deal" },
  ],
};

const buyerHighlights = [
  {
    icon: Search,
    title: "Ribuan prospek baru",
    description: "Cari calon customer dari kota, kategori, atau kata kunci yang relevan dengan produk client.",
  },
  {
    icon: Users,
    title: "Data siap dihubungi",
    description: "Lead hasil scraping, import, dan percakapan tersusun rapi sebelum masuk ke campaign.",
  },
  {
    icon: Target,
    title: "Follow-up sampai closing",
    description: "Tim bisa melihat balasan, status prospek, deal berjalan, dan hasil campaign tanpa rekap manual.",
  },
];

const features = [
  {
    icon: Search,
    title: "Scraping Calon Customer",
    description: "Ekstensi Chrome terintegrasi langsung dengan Google Maps. Atur kata kunci, area, dan jumlah hasil — scraping berjalan otomatis dan data tersimpan real-time ke dashboard.",
  },
  {
    icon: MessageSquareText,
    title: "Pusat Pesan WhatsApp",
    description: "Inbox, blast, follow-up, template, dan validasi kontak dibuat satu alur agar tim tidak perlu berpindah menu.",
  },
  {
    icon: ClipboardCheck,
    title: "CRM dan Tindak Lanjut",
    description: "Pantau prospek yang harus dihubungi, jadwal balasan, status deal, dan tugas tim agar tidak ada peluang yang terlewat.",
  },
  {
    icon: Database,
    title: "Database Prospek dan Pelanggan",
    description: "Kontak hasil scraping, lead masuk, status deal, percakapan, paket, dan aktivitas pelanggan tersimpan rapi.",
  },
  {
    icon: LineChart,
    title: "Laporan Operasional",
    description: "Pantau performa broadcast, konversi CRM, tagihan, percakapan, dan aktivitas workspace secara real-time.",
  },
  {
    icon: ShieldCheck,
    title: "Kontrol Profesional",
    description: "Peran pengguna, batas pemakaian, tagihan, audit, dan konfigurasi workspace disiapkan untuk operasional yang rapi.",
  },
];

const workflow = [
  {
    title: "Cari prospek",
    description: "Gunakan ekstensi Chrome Gaetin untuk mencari calon customer berdasarkan kota, kategori bisnis, kata kunci, atau pasar yang dituju.",
    metric: "01",
  },
  {
    title: "Rapikan",
    description: "Rapikan hasil scraping, segmentasikan lead, dan validasi nomor WhatsApp sebelum masuk ke campaign.",
    metric: "02",
  },
  {
    title: "Hubungi",
    description: "Jalankan blast, follow-up otomatis, alur CRM, dan tugas closing dari satu dashboard.",
    metric: "03",
  },
  {
    title: "Pantau",
    description: "Lihat performa campaign, percakapan masuk, deal berjalan, dan laporan penggunaan secara real-time.",
    metric: "04",
  },
];

const solutionCards = [
  {
    icon: Gauge,
    title: "Dashboard prospek dan campaign",
    description: "Tampilan operasional padat untuk melihat hasil scraping, database kontak, campaign, dan follow-up harian.",
  },
  {
    icon: LockKeyhole,
    title: "Akses pengguna aman",
    description: "Pengaturan peran, workspace, dan batas akses dibuat jelas agar tim bekerja sesuai tanggung jawabnya.",
  },
  {
    icon: PlugZap,
    title: "Siap integrasi",
    description: "Struktur fitur dibuat siap untuk gateway pembayaran, CRM eksternal, webhook, dan pengiriman pesan.",
  },
];

const pricing = [
  {
    name: "Starter",
    price: "Gratis",
    priceNote: "100 kredit trial",
    description: "Untuk mencoba semua fitur Gaetin tanpa biaya awal dan tanpa kartu kredit.",
    features: [
      "1 ruang kerja",
      "100 kredit awal",
      "20 scraper jobs/bulan",
      "Radius scraping 5km",
      "CRM & Inbox",
      "Blast & Campaign",
    ],
    highlighted: false,
    cta: "Coba Gratis",
  },
  {
    name: "Bisnis",
    price: "Rp199K",
    priceNote: "/bulan",
    description: "Paket utama dengan kredit melimpah dan batas lebih tinggi untuk operasional aktif.",
    features: [
      "2.000 kredit/bulan",
      "250 scraper jobs/bulan",
      "Radius scraping 15km",
      "500 lead per job",
      "Follow-up otomatis",
      "Bantuan prioritas",
    ],
    highlighted: true,
    cta: "Pilih Paket Bisnis",
  },
  {
    name: "Pro",
    price: "Rp499K",
    priceNote: "/bulan",
    description: "Untuk tim besar, agency, atau reseller dengan volume tinggi dan kebutuhan white-label.",
    features: [
      "6.000 kredit/bulan",
      "1.000 scraper jobs/bulan",
      "Radius scraping 20km",
      "1.500 lead per job",
      "White-label & branding",
      "Support prioritas VIP",
    ],
    highlighted: false,
    cta: "Pilih Paket Pro",
  },
];

const testimonials = [
  {
    quote: "Gaetin bikin pencarian prospek dan operasional WhatsApp marketing jauh lebih rapih. Tim kami bisa lihat lead, campaign, dan follow-up dalam satu tempat.",
    name: "Nadia Putri",
    role: "Founder, Local Beauty Brand",
    initial: "NP",
  },
  {
    quote: "Yang paling penting buat kami adalah owner dashboard-nya. Data client dan penggunaan fitur langsung kelihatan untuk ambil keputusan produk.",
    name: "Rizky Ananda",
    role: "Pemilik Sistem",
    initial: "RA",
  },
  {
    quote: "Alur campaign sampai laporan jadi lebih enak dipakai. Scraping 500 lead dari Google Maps selesai dalam hitungan menit, langsung siap di-blast.",
    name: "Dimas Pratama",
    role: "Koordinator Penjualan",
    initial: "DP",
  },
];

const footerLinks = {
  Produk: [
    { label: "Fitur", href: "#fitur" },
    { label: "Alur Kerja", href: "#workflow" },
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

export default function HomePage() {
  return (
    <main className="cg-shell min-h-screen text-foreground">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="landing-header fixed left-1/2 top-4 -translate-x-1/2" style={{ width: "min(calc(100vw - 2rem), 1180px)" }}>
        <nav className="cg-nav relative flex w-full items-center justify-between overflow-hidden rounded-full px-4 py-3 md:px-5">
          <Link href="/" className="flex min-w-0 items-center gap-3 pr-12 sm:pr-0">
            <span className="gradient-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white shadow-glow">
              G
            </span>
            <span className="text-base font-bold text-white">gaetin</span>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 sm:static sm:translate-y-0">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-white/90 transition hover:text-white sm:inline-flex"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="cg-button-glow gradient-primary inline-flex h-10 w-10 items-center justify-center gap-2 rounded-full text-sm font-bold text-white transition hover:scale-[1.02] sm:w-auto sm:px-4"
            >
              <span className="hidden sm:inline">Mulai</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="cg-section earth-hero-section relative isolate pb-20 pt-28 md:pb-28 md:pt-32">
        <div className="earth-video-bg" aria-hidden="true">
          <video className="earth-bg-video" autoPlay muted loop playsInline preload="metadata">
            <source src="/media/earth-spin.mp4" type="video/mp4" />
          </video>
          <div className="earth-orbit" />
          <div className="earth-orbit" />
          <span className="earth-pin pin-a" />
          <span className="earth-pin pin-b" />
          <span className="earth-pin pin-c" />
          <span className="earth-signal-line" />
        </div>

        <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-5xl flex-col items-center text-center">
          <div className="cg-kicker">
            <Sparkles className="h-4 w-4" />
            Scraping prospek · WhatsApp · CRM
          </div>
          <h1 className="mt-7 w-full max-w-[22rem] break-words text-balance text-4xl font-black leading-[1.05] text-white sm:max-w-5xl sm:text-6xl lg:text-7xl">
            Temukan calon customer baru, hubungi, lalu
            <span className="cg-gradient-text"> kelola sampai closing.</span>
          </h1>
          <p className="mt-6 w-full max-w-[20rem] text-sm leading-7 text-slate-300 sm:max-w-2xl sm:text-lg sm:leading-8">
            Gaetin membantu bisnis mendapatkan ribuan prospek baru lewat scraping Google Maps, merapikan data, mengirim WhatsApp, menjalankan follow-up, dan membaca hasilnya dari satu dashboard.
          </p>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="cg-button-glow gradient-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-white transition hover:scale-[1.02]"
            >
              Cari prospek sekarang
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="#simulasi"
              className="cg-pill inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
            >
              Hitung potensi hasil
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid w-full max-w-[20rem] grid-cols-1 gap-2 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center">
            {quickBenefits.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="interactive-chip inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-200"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Dashboard mock */}
        <div className="relative z-10 mx-auto mt-14 max-w-6xl">
          <div className="cg-card-strong rounded-[2rem] p-3 sm:p-4">
            <div className="overflow-hidden rounded-[1.55rem] border border-white/10 bg-[#080a14]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-300" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-slate-300 sm:block">
                  Scraping Lead / Campaign
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Aktif
                </div>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-[220px_1fr_300px]">
                <aside className="hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4 lg:block">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="gradient-primary h-9 w-9 rounded-2xl" />
                    <div>
                      <div className="h-2.5 w-20 rounded-full bg-white/70" />
                      <div className="mt-2 h-2 w-14 rounded-full bg-white/25" />
                    </div>
                  </div>
                  {["Ringkasan", "Scraping", "Campaign", "CRM", "Laporan"].map((item, index) => (
                    <div
                      key={item}
                      className={`mb-2 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm ${index === 0 ? "bg-primary/20 text-white" : "text-slate-400"}`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${index === 0 ? "bg-primary" : "bg-white/20"}`} />
                      {item}
                    </div>
                  ))}
                </aside>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {heroStats.map((stat) => (
                      <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
                        <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                        <p className="mt-2 text-2xl font-black text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">Pipeline Prospek</p>
                        <p className="mt-1 text-xs text-slate-400">Lead hasil scraping, segmentasi, dan follow-up</p>
                      </div>
                      <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                        +31.8%
                      </div>
                    </div>
                    <div className="relative h-48 overflow-hidden rounded-3xl border border-white/10 bg-[#070a12] p-3">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:48px_48px] opacity-45" />
                      <div className="absolute inset-x-4 bottom-5 top-4 rounded-[1.25rem] bg-gradient-to-t from-primary/10 to-transparent blur-xl" />
                      <svg className="relative z-10 h-full w-full overflow-visible" viewBox="0 0 320 170" role="img" aria-label="Grafik pertumbuhan pipeline prospek">
                        <defs>
                          <linearGradient id="pipeline-line" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor="hsl(151 78% 47%)" />
                            <stop offset="55%" stopColor="hsl(124 70% 52%)" />
                            <stop offset="100%" stopColor="hsl(82 90% 61%)" />
                          </linearGradient>
                          <linearGradient id="pipeline-area" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="hsl(151 78% 47% / 0.34)" />
                            <stop offset="100%" stopColor="hsl(151 78% 47% / 0)" />
                          </linearGradient>
                          <filter id="pipeline-glow" x="-20%" y="-40%" width="140%" height="180%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <path d={pipelineChart.area} fill="url(#pipeline-area)" />
                        <path d={pipelineChart.path} fill="none" stroke="url(#pipeline-line)" strokeLinecap="round" strokeWidth="5" filter="url(#pipeline-glow)" />
                        <path d={pipelineChart.path} fill="none" stroke="hsl(0 0% 100% / 0.72)" strokeLinecap="round" strokeWidth="1.5" />
                        {pipelineChart.points.map((point) => (
                          <g key={point.label}>
                            <circle cx={point.x} cy={point.y} r="8" fill="hsl(151 78% 47% / 0.2)" />
                            <circle cx={point.x} cy={point.y} r="4" fill="hsl(82 90% 61%)" />
                          </g>
                        ))}
                        {pipelineChart.points.map((point, index) => (
                          <text key={point.label} x={point.x} y="166" textAnchor={index === 0 ? "start" : index === pipelineChart.points.length - 1 ? "end" : "middle"} className="fill-slate-400 text-[10px] font-semibold">
                            {point.label}
                          </text>
                        ))}
                      </svg>
                    </div>
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-3xl border border-primary/25 bg-primary/10 p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-2xl text-white">
                        <WalletCards className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Catatan Paket</p>
                        <p className="text-xs text-slate-400">Saran model pembayaran</p>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-slate-300">
                      Paket bulanan cocok sebagai model utama. Tambahkan token sebagai add-on untuk blast besar, validasi nomor, atau pemakaian tinggi.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-sm font-bold text-white">Status Pelanggan</p>
                    <div className="mt-4 space-y-3">
                      {[
                        ["Aktif", "78%"],
                        ["Butuh onboarding", "14%"],
                        ["Risk", "8%"],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div className="mb-2 flex justify-between text-xs text-slate-400">
                            <span>{label}</span>
                            <span>{value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10">
                            <div className="gradient-primary h-2 rounded-full" style={{ width: value }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust features bar ──────────────────────────────────────────── */}
      <section className="cg-section relative z-10 py-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {trustFeatures.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                <Icon className="h-4 w-4 text-primary/70" />
                {item.label}
              </div>
            );
          })}
        </div>
        <div className="mt-5 border-t border-white/[0.06]" />
      </section>

      {/* ── Quick benefits ──────────────────────────────────────────────── */}
      <section className="cg-section grid-fade-section grid-fade-start py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {buyerHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="cg-card rounded-3xl p-6 transition hover:-translate-y-1 hover:border-primary/40">
                <div className="flex items-start gap-4">
                  <div className="gradient-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-glow">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="fitur" className="cg-section grid-fade-section py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="cg-kicker">
            <Zap className="h-4 w-4" />
            Fitur Gaetin
          </div>
          <h2 className="mt-5 text-3xl font-black text-white sm:text-5xl">
            Dari mencari ribuan prospek sampai mengubahnya jadi pelanggan.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Pengguna bisa melakukan scraping calon customer, merapikan kontak, menjalankan campaign WhatsApp, mengelola CRM, dan membaca laporan tanpa kehilangan konteks kerja.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="cg-card group rounded-3xl p-6 transition hover:-translate-y-1 hover:border-primary/45">
                <div className="gradient-primary flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-glow">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-black text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Workflow ────────────────────────────────────────────────────── */}
      <section id="workflow" className="cg-section grid-fade-section py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <div className="cg-kicker">
              <Workflow className="h-4 w-4" />
              Alur Kerja
            </div>
            <h2 className="mt-5 text-3xl font-black text-white sm:text-5xl">
              Dari prospek hasil scraping sampai pelanggan aktif, alurnya nyambung.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300">
              Setiap tahap dibuat sesuai alur Gaetin: cari calon customer, rapikan kontak, kirim pesan, balas percakapan, lalu pantau hasilnya.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {workflow.map((item) => (
              <div key={item.title} className="cg-card rounded-3xl p-6">
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">{item.metric}</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-primary/70 to-transparent" />
                </div>
                <h3 className="text-xl font-black text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Simulation ──────────────────────────────────────────────────── */}
      <section id="simulasi" className="cg-section grid-fade-section py-20">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="cg-kicker">
            <MousePointerClick className="h-4 w-4" />
            Coba sebelum daftar
          </div>
          <h2 className="mt-5 text-3xl font-black text-white sm:text-5xl">
            Calon pembeli bisa langsung melihat manfaatnya.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Simulasi ini memberi gambaran bagaimana kontak, balasan, follow-up, dan deal akan terbaca di Gaetin.
          </p>
        </div>
        <LandingConversionPanel />
      </section>

      {/* ── Solutions ───────────────────────────────────────────────────── */}
      <section className="cg-section grid-fade-section py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="cg-kicker">
            <PlugZap className="h-4 w-4" />
            Kegunaan
          </div>
          <h2 className="mt-5 text-3xl font-black text-white sm:text-5xl">
            Modulnya lengkap, tapi tetap terasa ringan dipakai.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {solutionCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="cg-card rounded-3xl p-7">
                <Icon className="h-8 w-8 text-primary" />
                <h3 className="mt-8 text-xl font-black text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Extension showcase ──────────────────────────────────────────── */}
      <section className="cg-section grid-fade-section py-16">
        <div className="cg-card-strong overflow-hidden rounded-[2rem]">
          <div className="grid gap-8 p-8 lg:grid-cols-2 lg:items-center lg:p-10">
            <div>
              <div className="cg-kicker">
                <Chrome className="h-4 w-4" />
                Ekstensi Chrome Gaetin
              </div>
              <h2 className="mt-5 text-3xl font-black text-white">
                Scraping langsung dari Google Maps, tanpa coding.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Install ekstensi Chrome gratis, buka Google Maps, atur kata kunci dan area — Gaetin scraping otomatis dan menyimpan lead ke dashboard kamu secara real-time.
              </p>
              <ul className="mt-6 space-y-2.5">
                {[
                  "Scraping nama, nomor, alamat, rating, jam buka",
                  "Filter berdasarkan kategori bisnis dan kota",
                  "Data tersimpan langsung ke database lead",
                  "Mode auto-scroll untuk hasil lebih banyak",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-5 text-sm font-bold text-white transition hover:border-primary/40 hover:bg-primary/15"
              >
                <DownloadCloud className="h-4 w-4" />
                Akses ekstensi dari dashboard
              </Link>
            </div>
            <div className="hidden rounded-3xl border border-white/10 bg-[#080a14]/80 p-6 lg:block">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="flex-1 truncate">Kafe Surabaya Pusat</span>
                <span className="text-emerald-400">Aktif</span>
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  { name: "Kopi Kina Roasters", rating: "4.8", phone: "+62 811-xxx-xxxx" },
                  { name: "Espresso Works", rating: "4.6", phone: "+62 812-xxx-xxxx" },
                  { name: "Warung Kopi Tugu", rating: "4.5", phone: "+62 813-xxx-xxxx" },
                  { name: "Daily Grind Cafe", rating: "4.7", phone: "+62 815-xxx-xxxx" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-white">{item.name}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">{item.phone}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
                      <Star className="h-3 w-3 fill-current" />
                      {item.rating}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-primary/25 bg-primary/10 px-3 py-2.5">
                <span className="text-xs font-semibold text-primary">Terscraping otomatis</span>
                <span className="text-xs font-bold text-white">4 / 500 lead</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="harga" className="cg-section grid-fade-section py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="cg-kicker">
            <Sparkles className="h-4 w-4" />
            Paket Harga
          </div>
          <h2 className="mt-5 text-3xl font-black text-white sm:text-5xl">
            Mulai gratis, upgrade saat butuh lebih.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Semua paket termasuk akses ke seluruh fitur. Perbedaan utama ada di jumlah kredit dan batas scraping per bulan. Tambah kredit kapan saja tanpa ganti paket.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pricing.map((plan) => (
            <article key={plan.name} className={`${plan.highlighted ? "cg-card-strong" : "cg-card"} rounded-[2rem] p-7`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{plan.description}</p>
                </div>
                {plan.highlighted ? (
                  <span className="shrink-0 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">Disarankan</span>
                ) : null}
              </div>
              <div className="mt-8 flex items-end gap-2">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="pb-1 text-sm text-slate-400">{plan.priceNote}</span>
              </div>
              <Link
                href="/register"
                className={`mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full text-sm font-bold transition ${
                  plan.highlighted
                    ? "cg-button-glow gradient-primary text-white hover:scale-[1.02]"
                    : "cg-pill text-white hover:border-white/25 hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </Link>
              <div className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-300" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Harga belum termasuk PPN. Diskon 20% untuk pembayaran tahunan. Kredit tambahan bisa dibeli kapan saja.
        </p>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" className="cg-section grid-fade-section py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="cg-kicker">
            <HelpCircle className="h-4 w-4" />
            Pertanyaan Umum
          </div>
          <h2 className="mt-5 text-3xl font-black text-white sm:text-5xl">
            Semua yang perlu diketahui sebelum mulai.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Masih ada pertanyaan lain? Hubungi tim kami melalui halaman Bantuan di dalam dashboard.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          <LandingFaq />
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section className="cg-section grid-fade-section py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="cg-kicker">
            <Star className="h-4 w-4" />
            Testimoni
          </div>
          <h2 className="mt-5 text-3xl font-black text-white sm:text-5xl">
            Dibuat untuk pemilik sistem yang ingin terlihat serius.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="cg-card rounded-3xl p-6">
              <div className="flex gap-1 text-amber-300">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-6 text-sm leading-7 text-slate-300">{testimonial.quote}</p>
              <div className="mt-8 flex items-center gap-3">
                <div className="gradient-primary flex h-11 w-11 items-center justify-center rounded-full text-sm font-black text-white">
                  {testimonial.initial}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{testimonial.name}</p>
                  <p className="text-xs text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="cg-section grid-fade-section pb-24 pt-10">
        <div className="cg-card-strong rounded-[2rem] p-8 text-center sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-black text-white sm:text-5xl">
            Gaetin siap jadi sistem utama untuk operasional WhatsApp-mu.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Daftar gratis dan dapatkan 100 kredit trial untuk mencoba semua fitur — scraping, blast, CRM, dan validasi nomor.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="cg-button-glow gradient-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-white transition hover:scale-[1.02]"
            >
              Daftar Gratis Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="cg-pill inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
            >
              Masuk ke dashboard
            </Link>
          </div>
          <p className="mt-5 text-xs text-slate-500">Tidak perlu kartu kredit · Bisa cancel kapan saja</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="cg-section border-t border-white/[0.07] pb-10 pt-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="gradient-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white shadow-glow">
                G
              </span>
              <span className="text-base font-bold text-white">gaetin</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-400">
              Platform scraping prospek, WhatsApp marketing, dan CRM untuk bisnis Indonesia.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <Link
                href="/register"
                className="cg-button-glow gradient-primary inline-flex h-9 items-center gap-2 rounded-full px-4 text-xs font-bold text-white transition hover:scale-[1.02]"
              >
                Mulai Gratis
              </Link>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">{group}</p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-slate-400 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.07] pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Gaetin. Semua hak dilindungi.
          </p>
          <p className="text-xs text-slate-600">
            Pembayaran aman via Xendit · SSL terenkripsi
          </p>
        </div>
      </footer>
    </main>
  );
}

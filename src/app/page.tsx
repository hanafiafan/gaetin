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
  X,
  Map,
  Shield,
  Phone,
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
  { icon: Sparkles, label: "100 kredit trial gratis" },
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

const features = [
  {
    icon: Search,
    title: "Scraping Calon Customer",
    description: "Ekstensi Chrome terintegrasi langsung dengan Google Maps. Atur kata kunci, area, dan jumlah hasil — data tersimpan real-time ke dashboard.",
    badge: null,
  },
  {
    icon: MessageSquareText,
    title: "Pusat Pesan WhatsApp",
    description: "Inbox, blast, follow-up, template, dan validasi kontak tersusun dalam satu alur agar tim tidak perlu berpindah menu.",
    badge: "Bisnis+",
  },
  {
    icon: ClipboardCheck,
    title: "CRM & Tindak Lanjut",
    description: "Pantau prospek, jadwal balasan, status deal, dan tugas tim agar tidak ada peluang yang terlewat.",
    badge: "Bisnis+",
  },
  {
    icon: Database,
    title: "Database Prospek",
    description: "Kontak, lead, deal, percakapan, dan aktivitas tersimpan rapi dan bisa difilter kapan saja.",
    badge: "Bisnis+",
  },
  {
    icon: LineChart,
    title: "Laporan Operasional",
    description: "Pantau performa broadcast, konversi CRM, tagihan, dan aktivitas workspace secara real-time.",
    badge: "Bisnis+",
  },
  {
    icon: ShieldCheck,
    title: "Kontrol Profesional",
    description: "Peran pengguna, batas pemakaian, tagihan, audit, dan konfigurasi workspace disiapkan untuk operasional yang rapi.",
    badge: "Bisnis+",
  },
];

const setupSteps = [
  {
    icon: Chrome,
    step: "01",
    title: "Install Ekstensi",
    description: "Download ekstensi Gaetin untuk Chrome. Install dalam 30 detik, tidak perlu coding.",
    color: "text-primary",
    bg: "bg-primary/ border-primary/",
  },
  {
    icon: Map,
    step: "02",
    title: "Aktifkan Fitur Maps",
    description: "Buka Google Maps, centang \"Perbarui hasil saat peta digeser\" — satu langkah krusial.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    highlight: true,
  },
  {
    icon: Shield,
    step: "03",
    title: "Izinkan Popup & Lokasi",
    description: "Aktifkan izin popup dan lokasi di Chrome untuk maps.google.com.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: Zap,
    step: "04",
    title: "Mulai Scraping",
    description: "Buat job scraping, buka Google Maps, dan lead langsung masuk ke dashboard secara real-time.",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
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
    initial: "NP",
    stars: 5,
  },
  {
    quote: "Yang paling saya suka adalah alurnya: scrape → validasi → blast dalam satu sistem. Tidak perlu pindah-pindah tools lagi.",
    name: "Rizky Ananda",
    role: "Sales Manager",
    initial: "RA",
    stars: 5,
  },
  {
    quote: "500 lead dari Google Maps selesai scraping dalam 15 menit. Langsung tersusun di CRM dan siap di-assign ke tim sales.",
    name: "Dimas Pratama",
    role: "Koordinator Penjualan",
    initial: "DP",
    stars: 5,
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

export default function HomePage() {
  return (
    <main className="cg-shell min-h-screen text-white">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="landing-header fixed left-1/2 top-4 -translate-x-1/2" style={{ width: "min(calc(100vw - 2rem), 1180px)" }}>
        <nav className="cg-nav relative flex w-full items-center justify-between overflow-hidden rounded-full px-4 py-3 md:px-5">
          <Link href="/" className="flex min-w-0 items-center gap-3 pr-12 sm:pr-0">
            <span className="gradient-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white shadow-glow">G</span>
            <span className="text-base font-bold text-white">gaetin</span>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 sm:static sm:translate-y-0">
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-white/90 transition hover:text-white sm:inline-flex">Masuk</Link>
            <Link href="/register" className="cg-button-glow gradient-primary inline-flex h-10 w-10 items-center justify-center gap-2 rounded-full text-sm font-bold text-white transition hover:scale-[1.02] sm:w-auto sm:px-4">
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
            Google Maps Scraper · WhatsApp · CRM
          </div>
          <h1 className="mt-7 w-full max-w-[22rem] break-words text-balance text-4xl font-black leading-[1.05] text-white sm:max-w-5xl sm:text-6xl lg:text-7xl">
            Ribuan prospek dari Google Maps,
            <span className="cg-gradient-text"> siap dihubungi via WhatsApp.</span>
          </h1>
          <p className="mt-6 w-full max-w-[20rem] text-sm leading-7 text-slate-300 sm:max-w-2xl sm:text-lg sm:leading-8">
            Gaetin mengekstrak data bisnis dari Google Maps lewat ekstensi Chrome, merapikan kontak, mengirim WhatsApp, dan mengelola follow-up dari satu dashboard.
          </p>

          {/* Trial callout */}
          <div className="mt-5 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary">
            ✓ Trial gratis · 100 kredit · Scraping langsung bisa dipakai · Tidak perlu kartu kredit
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/register" className="cg-button-glow gradient-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-white transition hover:scale-[1.02]">
              Coba Scraping Gratis
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link href="#setup" className="cg-pill inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10">
              Lihat cara kerja
              <ArrowRight className="h-4 w-4" />
            </Link>
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
                  Scraping Lead · Google Maps
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Aktif · 247 lead ditemukan
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
                    <div key={item} className={`mb-2 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm ${index === 0 ? "bg-primary/20 text-white" : "text-slate-400"}`}>
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
                        <p className="mt-1 text-xs text-slate-400">Scrape → Validasi → Follow-up → Closing</p>
                      </div>
                      <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">+31.8%</div>
                    </div>
                    <div className="relative h-48 overflow-hidden rounded-3xl border border-white/10 bg-[#070a12] p-3">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:48px_48px] opacity-45" />
                      <div className="absolute inset-x-4 bottom-5 top-4 rounded-[1.25rem] bg-gradient-to-t from-primary/10 to-transparent blur-xl" />
                      <svg className="relative z-10 h-full w-full overflow-visible" viewBox="0 0 320 170" role="img" aria-label="Grafik pipeline prospek">
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
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
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
                        <p className="text-sm font-bold text-white">Scraping Berjalan</p>
                        <p className="text-xs text-slate-400">kafe jakarta selatan</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: "Kopi Kina Roasters", cat: "Kafe", phone: "+62 811-xxx" },
                        { name: "Espresso Works", cat: "Kafe", phone: "+62 812-xxx" },
                        { name: "Daily Grind", cat: "Kafe", phone: "+62 815-xxx" },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-2.5 py-2">
                          <div className="h-6 w-6 shrink-0 rounded-lg bg-primary/20" />
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-semibold text-white">{item.name}</p>
                            <p className="text-[9px] text-slate-500">{item.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-2.5 py-2">
                      <span className="text-[11px] font-semibold text-primary">Live scraping</span>
                      <span className="text-[11px] font-bold text-white">247 / 500</span>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                    <p className="text-sm font-bold text-white">Status Workspace</p>
                    <div className="mt-4 space-y-3">
                      {[["Lead aktif", "78%"], ["Sudah divalidasi", "54%"], ["Siap di-blast", "31%"]].map(([label, value]) => (
                        <div key={label}>
                          <div className="mb-2 flex justify-between text-xs text-slate-400">
                            <span>{label}</span><span>{value}</span>
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

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="fitur" className="cg-section grid-fade-section py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="cg-kicker"><Zap className="h-4 w-4" />Fitur Gaetin</div>
          <h2 className="mt-5 text-3xl font-black text-white sm:text-5xl">
            Dari menemukan ribuan prospek sampai mengubahnya jadi pelanggan.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Trial gratis memberi akses ke scraping & ekspor. Upgrade untuk membuka WhatsApp marketing, CRM, dan seluruh fitur otomasi.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="cg-card group relative rounded-3xl p-6 transition hover:-translate-y-1 hover:border-primary/45">
                {feature.badge && (
                  <span className="absolute right-4 top-4 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {feature.badge}
                  </span>
                )}
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

      {/* ── Setup Steps ─────────────────────────────────────────────────── */}
      <section id="setup" className="cg-section grid-fade-section py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="cg-kicker"><Chrome className="h-4 w-4" />Setup 4 Langkah</div>
          <h2 className="mt-5 text-3xl font-black text-white sm:text-5xl">
            Dari install ekstensi sampai scraping pertama: 10 menit.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Tidak perlu coding. Ikuti 4 langkah ini dan kamu langsung bisa mulai scraping ribuan data bisnis dari Google Maps.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {setupSteps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className={`relative rounded-3xl border p-6 ${s.bg} ${s.highlight ? "ring-1 ring-amber-500/30" : ""}`}>
                {s.highlight && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-500/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-400 border border-amber-500/30">
                    Krusial
                  </span>
                )}
                <div className="mb-4 flex items-center justify-between">
                  <span className={`text-xs font-black ${s.color}`}>{s.step}</span>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <h3 className="text-lg font-black text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{s.description}</p>
              </div>
            );
          })}
        </div>

        {/* Maps checkbox visual */}
        <div className="mt-10 cg-card-strong overflow-hidden rounded-[2rem]">
          <div className="grid gap-8 p-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:p-10">
            <div>
              <div className="cg-kicker mb-4"><MapPin className="h-4 w-4" />Langkah Krusial #2</div>
              <h3 className="text-2xl font-black text-white">
                Centang kotak ini di Google Maps — wajib aktif!
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Setelah cari kata kunci bisnis di Google Maps, pastikan kotak{" "}
                <strong className="text-white">&ldquo;Perbarui hasil saat peta digeser&rdquo;</strong>{" "}
                sudah dicentang. Ini yang membuat ekstensi bisa mengambil data saat kamu menggeser peta.
              </p>
              <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
                ⚠️ Tanpa kotak ini dicentang, ekstensi tidak bisa melakukan scraping secara otomatis.
              </div>
              <Link
                href="/register"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-5 text-sm font-bold text-white transition hover:border-primary/40 hover:bg-primary/15"
              >
                <DownloadCloud className="h-4 w-4" />
                Mulai trial & ikuti panduan setup
              </Link>
            </div>

            {/* Google Maps mockup */}
            <div className="rounded-2xl border border-white/10 bg-[#1a1c2a] overflow-hidden">
              {/* Search bar */}
              <div className="flex items-center gap-2.5 border-b border-white/10 bg-[#1e2030] px-4 py-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/">
                  <MapPin className="h-3 w-3 text-primary" />
                </div>
                <span className="flex-1 text-sm text-slate-400">kafe jakarta pusat</span>
                <span className="text-xs text-slate-600">×</span>
              </div>
              {/* Results header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]">
                <span className="text-xs font-semibold text-slate-300">Hasil · 50+</span>
                <span className="text-[10px] text-slate-600">ℹ</span>
              </div>
              {/* THE CHECKBOX */}
              <div className="mx-4 my-3 rounded-xl border-2 border-red-500/60 bg-red-500/5 px-3 py-2.5 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-primary/50 bg-primary/">
                    <Check className="h-2.5 w-2.5 text-primary" />
                  </div>
                  <span className="text-sm text-white font-medium">Perbarui hasil saat peta digeser</span>
                </div>
                <p className="mt-1.5 text-[10px] font-bold text-red-400 uppercase tracking-wide">↑ Wajib dicentang!</p>
              </div>
              {/* Sample results */}
              <div className="space-y-0.5 px-2 pb-3">
                {["Kopi Nako · ★4.8 · Tanah Abang", "Escobar Coffee · ★4.7 · Menteng", "Filosofi Kopi · ★4.6 · Kemang"].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 rounded-lg px-2 py-2">
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-white/[0.06]" />
                    <span className="text-xs text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Simulation ──────────────────────────────────────────────────── */}
      <section id="simulasi" className="cg-section grid-fade-section py-20">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="cg-kicker"><MousePointerClick className="h-4 w-4" />Simulasi Hasil</div>
          <h2 className="mt-5 text-3xl font-black text-white sm:text-5xl">
            Lihat potensi hasilnya sebelum daftar.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Simulasikan berapa kontak, balasan, follow-up, dan deal yang bisa kamu hasilkan dengan Gaetin.
          </p>
        </div>
        <LandingConversionPanel />
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="harga" className="cg-section grid-fade-section py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="cg-kicker"><Sparkles className="h-4 w-4" />Paket Harga</div>
          <h2 className="mt-5 text-3xl font-black text-white sm:text-5xl">
            Mulai gratis dengan scraping. Upgrade untuk fitur penuh.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Trial gratis memberi kamu akses ke Google Maps scraping dan ekspor data. Upgrade ke Bisnis untuk membuka WhatsApp, CRM, blast, dan seluruh fitur pemasaran.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article key={plan.name} className={`${plan.highlighted ? "cg-card-strong" : "cg-card"} relative rounded-[2rem] p-7`}>
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-glow">
                  {plan.badge}
                </span>
              )}
              <div>
                <h3 className="text-xl font-black text-white">{plan.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{plan.description}</p>
              </div>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="pb-1 text-sm text-slate-400">{plan.priceNote}</span>
              </div>
              <Link
                href={plan.ctaHref}
                className={`mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full text-sm font-bold transition ${
                  plan.highlighted
                    ? "cg-button-glow gradient-primary text-white hover:scale-[1.02]"
                    : "cg-pill text-white hover:border-white/25 hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </Link>
              <div className="mt-6 space-y-2.5">
                {plan.features.map((feature) => (
                  <div key={feature.label} className="flex items-center gap-3 text-sm">
                    {feature.included ? (
                      <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <X className="h-4 w-4 shrink-0 text-slate-600" />
                    )}
                    <span className={feature.included ? "text-slate-300" : "text-slate-600"}>{feature.label}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-center text-sm text-slate-500">
            Harga belum termasuk PPN · Diskon 20% untuk pembayaran tahunan · Kredit tambahan bisa dibeli kapan saja
          </p>
          <p className="text-center text-xs text-slate-600">
            Trial tidak perlu kartu kredit · Upgrade bisa dilakukan kapan saja dari dashboard
          </p>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" className="cg-section grid-fade-section py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="cg-kicker"><HelpCircle className="h-4 w-4" />Pertanyaan Umum</div>
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
          <div className="cg-kicker"><Star className="h-4 w-4" />Testimoni</div>
          <h2 className="mt-5 text-3xl font-black text-white sm:text-5xl">
            Dari scraping sampai closing, semuanya dalam satu dashboard.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="cg-card rounded-3xl p-6">
              <div className="flex gap-1 text-amber-300">
                {Array.from({ length: testimonial.stars }).map((_, index) => (
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
            Mulai scraping Google Maps sekarang — gratis.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Daftar dan dapatkan 100 kredit trial. Cukup untuk scraping ratusan lead dari Google Maps dan ekspor ke CSV — tanpa perlu kartu kredit.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="cg-button-glow gradient-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-white transition hover:scale-[1.02]">
              Daftar & Mulai Scraping
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="cg-pill inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10">
              Sudah punya akun? Masuk
            </Link>
          </div>
          <p className="mt-5 text-xs text-slate-500">Tidak perlu kartu kredit · Setup 10 menit · Trial bisa upgrade kapan saja</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="cg-section border-t border-white/[0.07] pb-10 pt-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="gradient-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white shadow-glow">G</span>
              <span className="text-base font-bold text-white">gaetin</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-400">
              Platform scraping prospek Google Maps, WhatsApp marketing, dan CRM untuk bisnis Indonesia.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <Link href="/register" className="cg-button-glow gradient-primary inline-flex h-9 items-center gap-2 rounded-full px-4 text-xs font-bold text-white transition hover:scale-[1.02]">
                Mulai Gratis
              </Link>
            </div>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">{group}</p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm font-medium text-slate-400 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.07] pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} Gaetin. Semua hak dilindungi.</p>
          <p className="text-xs text-slate-600">Pembayaran aman via Xendit · SSL terenkripsi</p>
        </div>
      </footer>
    </main>
  );
}

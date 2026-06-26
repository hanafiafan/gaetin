import Link from "next/link";
import LandingConversionPanel from "@/components/landing-conversion-panel";
import {
  ArrowRight,
  Check,
  ChevronRight,
  ClipboardCheck,
  Database,
  Gauge,
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
    description: "Kumpulkan ribuan prospek baru untuk UMKM, perusahaan, pemilik produk, atau client berdasarkan area, kategori, dan kebutuhan pasar.",
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
    description: "Gunakan scraper untuk mencari calon customer berdasarkan kota, kategori bisnis, kata kunci, atau pasar yang dituju.",
    metric: "01",
  },
  {
    title: "Rapikan",
    description: "Rapikan hasil scraping, segmentasikan lead, dan validasi nomor sebelum masuk ke campaign.",
    metric: "02",
  },
  {
    title: "Hubungi",
    description: "Jalankan blast, follow-up otomatis, alur CRM, dan tugas closing.",
    metric: "03",
  },
  {
    title: "Pantau",
    description: "Pemilik sistem melihat penggunaan fitur, performa customer, dan laporan pembayaran.",
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
    name: "Awal",
    price: "Rp149K",
    description: "Untuk bisnis kecil yang mulai mencari prospek dan merapikan WhatsApp marketing.",
    features: ["1 ruang kerja", "2.500 kontak", "Scraping dasar", "Blast dasar", "Template pesan", "Laporan standar"],
  },
  {
    name: "Bisnis",
    price: "Rp399K",
    description: "Paket utama dengan limit jelas dan add-on token untuk pemakaian besar.",
    features: ["5 ruang kerja", "25.000 kontak", "Scraping prospek", "Alur CRM", "Laporan lengkap", "Bantuan prioritas"],
    highlighted: true,
  },
  {
    name: "Skala",
    price: "Khusus",
    description: "Untuk agency, reseller, atau client dengan volume dan kebutuhan khusus.",
    features: ["Ruang kerja tanpa batas", "Kuota khusus", "Pendampingan onboarding", "Pengaturan lanjutan", "Integrasi khusus"],
  },
];

const testimonials = [
  {
    quote: "Gaetin bikin pencarian prospek dan operasional WhatsApp marketing jauh lebih rapih. Tim kami bisa lihat lead, campaign, dan follow-up dalam satu tempat.",
    name: "Nadia Putri",
    role: "Founder, Local Beauty Brand",
  },
  {
    quote: "Yang paling penting buat kami adalah owner dashboard-nya. Data client dan penggunaan fitur langsung kelihatan untuk ambil keputusan produk.",
    name: "Rizky Ananda",
    role: "Pemilik Sistem",
  },
  {
    quote: "Desain barunya terasa seperti alat profesional, bukan dashboard asal jadi. Alur campaign sampai laporan jadi lebih enak dipakai.",
    name: "Dimas Pratama",
    role: "Koordinator Penjualan",
  },
];

export default function HomePage() {
  return (
    <main className="cg-shell min-h-screen text-foreground">
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
            Scraping prospek, WhatsApp, dan CRM
          </div>
          <h1 className="mt-7 w-full max-w-[22rem] break-words text-balance text-4xl font-black leading-[1.05] text-white sm:max-w-5xl sm:text-6xl lg:text-7xl">
            Temukan calon customer baru, hubungi, lalu
            <span className="cg-gradient-text"> kelola sampai closing.</span>
          </h1>
          <p className="mt-6 w-full max-w-[20rem] text-sm leading-7 text-slate-300 sm:max-w-2xl sm:text-lg sm:leading-8">
            Gaetin membantu UMKM, perusahaan, pemilik produk, dan client mendapatkan ribuan prospek baru lewat scraping, merapikan data, mengirim WhatsApp, menjalankan follow-up, dan membaca hasilnya dari satu dashboard.
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
                      className={`mb-2 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm ${
                        index === 0 ? "bg-primary/20 text-white" : "text-slate-400"
                      }`}
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

      <section id="harga" className="cg-section grid-fade-section py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="cg-kicker">
            <Sparkles className="h-4 w-4" />
            Paket Harga
          </div>
          <h2 className="mt-5 text-3xl font-black text-white sm:text-5xl">
            Paket bulanan jelas, token sebagai tambahan.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Paket bulanan lebih mudah dipahami pelanggan. Token cocok sebagai tambahan untuk validasi nomor, blast volume tinggi, atau kebutuhan khusus.
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
                  <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">Disarankan</span>
                ) : null}
              </div>
              <div className="mt-8 flex items-end gap-2">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                {plan.price !== "Khusus" ? <span className="pb-1 text-sm text-slate-400">/bulan</span> : null}
              </div>
              <Link
                href="/register"
                className={`mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full text-sm font-bold transition ${
                  plan.highlighted
                    ? "cg-button-glow gradient-primary text-white hover:scale-[1.02]"
                    : "cg-pill text-white hover:border-white/25 hover:bg-white/10"
                }`}
              >
                {plan.highlighted ? "Pilih Paket Bisnis" : "Pilih Paket"}
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
      </section>

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
                  {testimonial.name
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")}
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

      <section className="cg-section grid-fade-section pb-24 pt-10">
        <div className="cg-card-strong rounded-[2rem] p-8 text-center sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-black text-white sm:text-5xl">
            Gaetin siap jadi sistem utama untuk operasional WhatsApp-mu.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Masuk ke dashboard untuk mengecek semua menu, mulai dari kontak, pesan, CRM, tagihan, sampai laporan.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="cg-button-glow gradient-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-white transition hover:scale-[1.02]"
            >
              Masuk dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

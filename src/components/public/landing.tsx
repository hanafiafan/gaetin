"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { PublicShell, Reveal } from "./public-shell";
import type { EffectivePlans } from "@/lib/plans-store";
import { PLANS, TRIAL_CREDITS } from "@/config/plans";
import type { EditorialPost } from "@/lib/public/editorial";

const flows = [
  {
    label: "Temukan",
    icon: Search,
    title: "Peluang ada di sekitar Anda.",
    description:
      "Telusuri bisnis berdasarkan kata kunci dan lokasi melalui ekstensi Google Maps. Simpan hasilnya sebagai langkah awal riset prospek.",
    tag: "01 / GOOGLE MAPS",
    action: "Cari kedai kopi di Bandung",
    rows: ["Kopi Pagi · Dago", "Ruang Seduh · Cihampelas", "Temu Kopi · Braga"],
    badge: "Prospek ditemukan",
  },
  {
    label: "Hubungkan",
    icon: MessageCircle,
    title: "Percakapan yang lebih terarah.",
    description:
      "Validasi nomor, pilih kontak yang relevan, lalu kelola WhatsApp, email, dan balasan dari satu alur. Jadwalkan tindak lanjut sesuai kebutuhan.",
    tag: "02 / OUTREACH",
    action: "Halo {{nama}}, boleh berkenalan?",
    rows: [
      "Pilih penerima yang relevan",
      "Personalisasi pesan pembuka",
      "Kelola balasan di inbox",
    ],
    badge: "Siap ditinjau",
  },
  {
    label: "Kembangkan",
    icon: Workflow,
    title: "Setiap peluang punya langkah berikutnya.",
    description:
      "Pindahkan prospek di pipeline, catat tugas tim dan pantau perkembangan. Jadi, Anda tahu siapa yang perlu ditindaklanjuti hari ini.",
    tag: "03 / CRM & FOLLOW-UP",
    action: "Pipeline tim penjualan",
    rows: [
      "Prospek baru · Kopi Pagi",
      "Sudah dihubungi · Ruang Seduh",
      "Negosiasi · Temu Kopi",
    ],
    badge: "Terorganisasi",
  },
];
const faqs = [
  [
    "Apa yang bisa saya coba gratis?",
    "Pendaftaran memberikan " +
      TRIAL_CREDITS +
      " kredit awal. Anda dapat mulai mengenal alur pengumpulan prospek. Hak fitur dan batas penggunaan mengikuti paket serta status akun yang tampil di workspace.",
  ],
  [
    "Apakah saya perlu menginstal aplikasi?",
    "Dashboard berjalan di browser. Untuk mengambil data dari Google Maps, pasang ekstensi Chrome Hellens melalui panduan. WhatsApp perlu dihubungkan melalui QR dari workspace.",
  ],
  [
    "Apakah setiap bisnis memiliki email dan nomor WhatsApp?",
    "Tidak selalu. Hasil bergantung pada data publik yang tersedia. Email dicari dari website bisnis, dan nomor perlu divalidasi sebelum dipakai untuk komunikasi.",
  ],
  [
    "Bagaimana kredit digunakan?",
    "Kredit digunakan untuk aksi seperti menyimpan lead, validasi dan pengiriman. Besaran biaya per aksi dan sisa saldo dapat dilihat di workspace sebelum menjalankan pekerjaan.",
  ],
  [
    "Bisakah saya bekerja bersama tim?",
    "Bisa. Undang anggota ke workspace, atur perannya dan kelola kontak serta tindak lanjut bersama. Ketersediaan fitur mengikuti paket yang aktif.",
  ],
];
const money = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

function CrowdBanner() {
  const target = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-5, 8]);
  return (
    <div ref={target} className="pub-crowd-banner">
      <motion.div style={{ y: reduced ? 0 : y, scale: reduced ? 1 : 1.12 }}>
        <Image
          src="/illustrations/business-crowd.webp"
          alt="Ilustrasi pelaku usaha: pemilik kafe, florist, kreator, chef dan tim penjualan."
          width={2172}
          height={724}
          sizes="(max-width: 800px) 100vw, 1200px"
        />
      </motion.div>
      <motion.span
        className="pub-crowd-sticker"
        style={{ rotate: reduced ? 0 : rotate }}
      >
        BISNIS ANDA.
        <br />
        PELUANG TANPA JEDA. <Sparkles size={22} />
      </motion.span>
    </div>
  );
}

function Demo() {
  const [selected, setSelected] = useState(0);
  const reduced = useReducedMotion();
  const flow = flows[selected];
  return (
    <div className="pub-demo" id="demo">
      <div className="pub-demo-copy">
        <span className="pub-eyebrow">COBA ALURNYA, RASAKAN BEDANYA</span>
        <h2>
          BANYAK LANGKAH.
          <br />
          <span>SATU TEMPAT.</span>
        </h2>
        <div className="pub-tabs" aria-label="Tahap demonstrasi">
          {flows.map((item, i) => (
            <button
              key={item.label}
              onClick={() => setSelected(i)}
              aria-pressed={selected === i}
              className={selected === i ? "is-active" : ""}
            >
              <item.icon size={17} />
              {item.label}
            </button>
          ))}
        </div>
        <p>{flow.description}</p>
        <Link className="pub-text-link" href="/register">
          Coba dengan bisnis Anda <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="pub-demo-stage">
        <div className="pub-demo-toolbar">
          <span>
            <i />
            <i />
            <i />
          </span>
          <span>hellens / workspace</span>
          <span>DEMO</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            className="pub-demo-content"
            key={selected}
            initial={{ opacity: 0, y: reduced ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="pub-eyebrow">{flow.tag}</span>
            <h3>{flow.title}</h3>
            <div className="pub-demo-search">
              <flow.icon size={19} />
              {flow.action}
              <ArrowUpRight size={18} />
            </div>
            {flow.rows.map((row, i) => (
              <div className="pub-demo-row" key={row}>
                <span className={"pub-avatar avatar-" + i}>
                  {["KP", "RS", "TK"][i]}
                </span>
                <div>
                  <b>{row}</b>
                  <small>
                    {selected === 0
                      ? "Bandung, Jawa Barat"
                      : "Contoh alur kerja Hellens"}
                  </small>
                </div>
                <Check size={16} />
              </div>
            ))}
            <div className="pub-demo-note">
              <span className="pub-status-dot" />
              {flow.badge}
              <span>Data ilustrasi</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Landing({
  pricing,
  posts,
}: {
  pricing: EffectivePlans;
  posts: Pick<
    EditorialPost,
    "slug" | "title" | "excerpt" | "category" | "readTime" | "art"
  >[];
}) {
  const [yearly, setYearly] = useState(false);
  const [paused, setPaused] = useState(false);
  return (
    <PublicShell>
      <main id="main-content">
        <section className="pub-hero">
          <div className="pub-wrap">
            <div className="pub-hero-kicker">
              <span>
                <i className="pub-status-dot" /> PROSPECTING & CUSTOMER
                WORKSPACE
              </span>
              <span>HELLENS / BUILT FOR YOUR NEXT CUSTOMER</span>
            </div>
            <div className="pub-hero-composition">
              <Reveal className="pub-hero-copy">
                <h1 className="pub-product-title">
                  CARI PROSPEK.
                  <br />
                  <em>MULAI CHAT.</em>
                  <br />
                  KELOLA DEAL.
                </h1>
                <p className="pub-hero-description">
                  Dari data bisnis Google Maps ke WhatsApp, email, dan pipeline
                  CRM. Kelola pencarian prospek sampai tindak lanjut tim dalam
                  satu workspace.
                </p>
                <div className="pub-channel-list">
                  <span>Google Maps</span>
                  <span>WhatsApp & email</span>
                  <span>CRM & follow-up</span>
                </div>
                <div className="pub-hero-action">
                  <Link href="/register" className="pub-button">
                    Mulai cari prospek <ArrowUpRight size={20} />
                  </Link>
                  <small>
                    {TRIAL_CREDITS} kredit awal · Tanpa kartu kredit
                  </small>
                </div>
              </Reveal>
              <Reveal className="pub-hero-art">
                <span className="pub-art-label">
                  DARI PETA KE PERCAKAPAN ↗
                </span>
                <Image
                  src="/illustrations/prospect-city.webp"
                  alt="Miniatur bisnis lokal yang terhubung dengan kartu kontak, email, dan percakapan."
                  width={1536}
                  height={1024}
                  priority
                  sizes="(max-width: 800px) 100vw, 55vw"
                />
                <span className="pub-floating-chip pub-chip-map">
                  <MapPin size={18} /> Riset bisnis lokal
                </span>
                <span className="pub-floating-chip pub-chip-crm">
                  <Workflow size={18} /> Satu alur kerja
                </span>
                <span className="pub-art-caption">
                  TEMUKAN → HUBUNGI → TINDAK LANJUTI
                </span>
              </Reveal>
            </div>
            <div className="pub-hero-bottom">
              <p>
                Riset lebih terarah.
                <br />
                Tindak lanjut lebih tertata.
                <br />
                <b>Google Maps, WhatsApp, email & CRM. Satu Hellens.</b>
              </p>

              <a
                href="#fitur"
                className="pub-scroll-cue"
                aria-label="Jelajahi fitur"
              >
                <ArrowDown size={22} />
                <span>
                  SCROLL TO
                  <br />
                  EXPLORE
                </span>
              </a>
            </div>
          </div>
        </section>
        <section className="pub-intro pub-wrap pub-section" id="fitur">
          <Reveal className="pub-section-heading">
            <div>
              <span className="pub-eyebrow">01 — KONEKSI YANG BERARTI</span>
              <h2>
                BISNIS HEBAT DIMULAI
                <br />
                DARI <span className="pub-orange-text">KENALAN BARU.</span>
              </h2>
            </div>
            <p>
              Lebih sedikit tab terbuka.
              <br />
              Lebih banyak peluang tertata.
              <br />
              <br />
              Hellens menyatukan perjalanan dari menemukan prospek hingga
              menindaklanjuti percakapan.
            </p>
          </Reveal>
          <Reveal>
            <CrowdBanner />
          </Reveal>
          <div className="pub-fact-grid">
            {[
              {
                n: "01",
                title: "Workspace terpadu",
                sub: "Prospek sampai tindak lanjut",
              },
              {
                n: "03",
                title: "Alur yang terhubung",
                sub: "Temukan, hubungkan, kembangkan",
              },
              {
                n: String(TRIAL_CREDITS),
                title: "Kredit untuk mulai",
                sub: "Kenali alurnya lebih dahulu",
              },
              {
                n: "∞",
                title: "Ide untuk tumbuh",
                sub: "Anda tentukan langkah berikutnya",
              },
            ].map((s) => (
              <div key={s.title}>
                <strong>{s.n}</strong>
                <span>
                  {s.title}
                  <small>{s.sub}</small>
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="pub-product-section">
          <div className="pub-wrap pub-section">
            <Reveal>
              <Demo />
            </Reveal>
            <Reveal className="pub-outreach-art">
              <Image
                src="/illustrations/outreach-studio.webp"
                alt="Ilustrasi email, percakapan, kartu kontak, dan papan CRM yang saling terhubung."
                width={1536}
                height={1024}
                sizes="(max-width: 800px) 100vw, 60vw"
              />
              <div>
                <span className="pub-eyebrow">BUKAN SEKADAR DAFTAR KONTAK</span>
                <h2>
                  SETIAP KONTAK.
                  <br />
                  ADA LANJUTANNYA.
                </h2>
                <p>
                  Personalisasi pesan, kelola balasan, dan catat tahap
                  penjualan. Tim Anda selalu punya konteks untuk percakapan
                  berikutnya.
                </p>
                <Link className="pub-text-link" href="/panduan">
                  Pelajari alurnya <ArrowUpRight size={18} />
                </Link>
              </div>
            </Reveal>
            <div className="pub-feature-grid">
              {[
                {
                  icon: MapPin,
                  number: "01",
                  title: "Cari yang relevan.",
                  text: "Bangun daftar prospek dari kategori dan lokasi bisnis yang sesuai.",
                  cls: "feature-orange",
                },
                {
                  icon: MessageCircle,
                  number: "02",
                  title: "Mulai percakapan.",
                  text: "WhatsApp, email dan template pesan untuk pendekatan yang lebih personal.",
                  cls: "feature-lilac",
                },
                {
                  icon: Users,
                  number: "03",
                  title: "Jaga momentumnya.",
                  text: "Kontak, pipeline dan tugas tim saling terhubung dalam satu workspace.",
                  cls: "feature-green",
                },
              ].map((f) => (
                <Reveal key={f.number}>
                  <article className={"pub-feature-card " + f.cls}>
                    <div>
                      <span>{f.number}</span>
                      <f.icon size={44} strokeWidth={1.4} />
                    </div>
                    <h3>{f.title}</h3>
                    <p>{f.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        <div className="pub-marquee">
          <div
            aria-hidden="true"
            style={{ animationPlayState: paused ? "paused" : "running" }}
          >
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i}>
                LEBIH DEKAT KE PELANGGAN <i>✳</i> LEBIH JAUH BISNIS BERJALAN{" "}
                <i>↗</i>{" "}
              </span>
            ))}
          </div>
          <button onClick={() => setPaused(!paused)} aria-pressed={paused}>
            {paused ? "Putar animasi" : "Jeda animasi"}
          </button>
        </div>
        <section className="pub-wrap pub-section" id="cara-kerja">
          <div className="pub-process-grid">
            <Reveal>
              <span className="pub-eyebrow">02 — MULAI DARI SINI</span>
              <h2>
                DARI “HALO”
                <br />
                KE PELUANG
                <br />
                <span className="pub-orange-text">BERIKUTNYA.</span>
              </h2>
              <Link href="/panduan" className="pub-button pub-button-dark">
                Buka panduan lengkap <ArrowUpRight size={19} />
              </Link>
            </Reveal>
            <div>
              {[
                {
                  title: "Siapkan ruang kerja.",
                  text: "Buat akun, pasang ekstensi Chrome dan kenali fitur yang tersedia pada paket Anda.",
                },
                {
                  title: "Temukan calon pelanggan.",
                  text: "Tentukan kategori dan lokasi. Periksa hasil, lalu simpan kontak yang relevan untuk bisnis Anda.",
                },
                {
                  title: "Bangun hubungan baik.",
                  text: "Mulai percakapan dengan konteks yang jelas. Catat respons dan atur langkah selanjutnya bersama tim.",
                },
              ].map((step, i) => (
                <Reveal key={step.title} className="pub-process-step">
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                  <ArrowUpRight />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        <section className="pub-pricing-section" id="harga">
          <div className="pub-wrap pub-section">
            <Reveal className="pub-section-heading">
              <div>
                <span className="pub-eyebrow">03 — RUANG UNTUK BERKEMBANG</span>
                <h2>
                  MULAI KECIL.
                  <br />
                  RENCANAKAN <span className="pub-orange-text">BESAR.</span>
                </h2>
              </div>
              <div>
                <p>
                  Pilih ruang kerja yang sesuai dengan ritme bisnis Anda.
                  Upgrade ketika siap.
                </p>
                <div
                  className="pub-billing-switch"
                  aria-label="Siklus pembayaran"
                >
                  <button
                    aria-pressed={!yearly}
                    onClick={() => setYearly(false)}
                  >
                    Bulanan
                  </button>
                  <button aria-pressed={yearly} onClick={() => setYearly(true)}>
                    Tahunan{" "}
                    <span>−{Math.round(pricing.yearlyDiscount * 100)}%</span>
                  </button>
                </div>
              </div>
            </Reveal>
            <div className="pub-price-grid">
              {pricing.plans.map((plan, i) => {
                const total = Math.round(
                  plan.monthlyPrice * 12 * (1 - pricing.yearlyDiscount),
                );
                const features = PLANS[plan.id].features;
                return (
                  <article
                    key={plan.id}
                    className={
                      "pub-price-card " + (i === 1 ? "pub-price-featured" : "")
                    }
                  >
                    <div className="pub-price-label">
                      <span>{plan.name}</span>
                      {i === 1 && <span>UNTUK BISNIS AKTIF ↗</span>}
                    </div>
                    <h3>
                      {plan.monthlyPrice === 0
                        ? "Gratis."
                        : money(
                            yearly ? Math.round(total / 12) : plan.monthlyPrice,
                          )}
                      {plan.monthlyPrice > 0 && <small>/bulan</small>}
                    </h3>
                    <p className="pub-price-caption">
                      {plan.monthlyPrice === 0
                        ? "Mulai mengenal alur Hellens."
                        : yearly
                          ? "Ditagih " + money(total) + " per tahun."
                          : "Ditagih setiap bulan."}
                    </p>
                    <Link
                      className={
                        "pub-button " +
                        (i === 1 ? "pub-button-dark" : "pub-button-outline")
                      }
                      href="/register"
                    >
                      {i === 0 ? "Mulai gratis" : "Mulai dengan " + plan.name}
                      <ArrowUpRight size={18} />
                    </Link>
                    <ul>
                      {[
                        plan.monthlyCredits.toLocaleString("id-ID") +
                          (i === 0 ? " kredit awal" : " kredit / bulan"),
                        plan.limits.scraperJobsPerMonth +
                          " job scraping / bulan",
                        plan.limits.scraperMaxResultsPerJob.toLocaleString(
                          "id-ID",
                        ) + " hasil maksimal / job",
                        "Ekspor CSV & Excel",
                        ...(features.blast
                          ? [
                              "WhatsApp & email outreach",
                              "CRM, inbox & follow-up",
                            ]
                          : []),
                        ...(features.whiteLabel
                          ? ["Branding workspace", "Dukungan prioritas"]
                          : []),
                      ].map((f) => (
                        <li key={f}>
                          <Check size={15} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
            <p className="pub-price-fine">
              Kredit digunakan sesuai aksi. Batas fitur mengikuti paket aktif.
              Rincian transaksi ditampilkan sebelum pembayaran.
            </p>
          </div>
        </section>
        <section className="pub-wrap pub-section">
          <Reveal className="pub-section-heading">
            <div>
              <span className="pub-eyebrow">04 — CATATAN UNTUK TUMBUH</span>
              <h2>
                IDE BAGUS.
                <br />
                <span className="pub-orange-text">LANGKAH NYATA.</span>
              </h2>
            </div>
            <Link href="/blog" className="pub-text-link">
              Jelajahi jurnal <ArrowUpRight size={19} />
            </Link>
          </Reveal>
          <div className="pub-article-grid">
            {posts.slice(0, 3).map((post, i) => (
              <Link
                key={post.slug}
                href={"/blog/" + post.slug}
                className="pub-article-card"
              >
                <div className={"pub-article-art art-" + i}>
                  <span>{post.art}</span>
                  <ArrowUpRight size={32} />
                  <small>HELLENS JOURNAL / 0{i + 1}</small>
                </div>
                <div className="pub-article-meta">
                  {post.category}
                  <span>{post.readTime} menit baca</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="pub-faq-section" id="faq">
          <div className="pub-wrap pub-section pub-faq-grid">
            <div>
              <span className="pub-eyebrow">05 — SEBELUM MULAI</span>
              <h2>
                MASIH
                <br />
                PENASARAN<span className="pub-orange-text">?</span>
              </h2>
              <p>Kami bantu membuat langkah pertama lebih jelas.</p>
              <Link className="pub-text-link" href="/panduan">
                Buka pusat panduan <ArrowUpRight size={18} />
              </Link>
            </div>
            <div>
              {faqs.map(([q, a]) => (
                <details key={q} className="pub-faq">
                  <summary>
                    {q}
                    <Plus size={21} />
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

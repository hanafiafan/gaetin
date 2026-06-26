import { prisma } from "@/lib/db/prisma";

export interface LandingContent {
  heroTitle: string;
  heroSubtitle: string;
  features: { title: string; desc: string }[];
  faq: { q: string; a: string }[];
}

export const DEFAULT_LANDING: LandingContent = {
  heroTitle: "Cari leads. Gaet pelanggan. Tutup deal.",
  heroSubtitle:
    "Ambil lead dari Google Maps, kelola terstruktur, kirim WhatsApp, layani balasan, sampai closing dalam satu ruang kerja.",
  features: [
    { title: "Maps Scraper", desc: "Tentukan lokasi di peta + radius, ambil lead bisnis lengkap dengan nomor WA." },
    { title: "Kelola Lead", desc: "Saring, beri skor, kelompokkan jadi segmen, impor CSV/Excel." },
    { title: "WhatsApp Blast", desc: "Kirim pesan personal massal dengan jeda aman & variasi anti-spam." },
    { title: "Inbox / CS", desc: "Balas pesan masuk dua arah, assign ke tim, status percakapan." },
    { title: "CRM + ROI", desc: "Pipeline kanban sampai closing, catat nilai deal & hitung ROI." },
    { title: "Follow-up Otomatis", desc: "Kejar lead yang belum balas; berhenti sendiri saat mereka membalas." },
  ],
  faq: [
    { q: "Apa itu kredit?", a: "Kredit dipakai saat menyimpan lead jadi kontak dan validasi nomor. Tiap paket memberi jatah kredit bulanan, dan bisa top-up kapan saja." },
    { q: "Metode pembayaran apa saja?", a: "Pembayaran via Xendit: transfer/virtual account, e-wallet, dan QRIS." },
    { q: "Apakah nomor WhatsApp saya aman?", a: "Pakai nomor bisnis khusus dan ikuti batas kirim harian. Sistem punya pengaman anti-spam." },
    { q: "Bisa coba dulu?", a: "Bisa. Daftar gratis dan dapat kredit trial untuk mencoba scraping dan fitur inti." },
  ],
};

export async function getLandingContent(): Promise<LandingContent> {
  const s = await prisma.siteSetting.findUnique({ where: { key: "landing" } });
  if (!s) return DEFAULT_LANDING;
  return { ...DEFAULT_LANDING, ...(s.value as Partial<LandingContent>) };
}

export async function setLandingContent(content: LandingContent): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: "landing" },
    update: { value: content as object },
    create: { key: "landing", value: content as object },
  });
}

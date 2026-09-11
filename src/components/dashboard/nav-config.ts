import {
  BarChart3,
  Bot,
  Chrome,
  CheckCircle2,
  CreditCard,
  FileText,
  Headphones,
  Inbox,
  LayoutDashboard,
  Mail,
  Megaphone,
  MessageSquareText,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  SquareKanban,
  UserSearch,
  Users,
} from "lucide-react";
import type { PlanFeatures } from "@/config/plans";
import type { SectionTone } from "@/components/dashboard/section-tone";

export type NavItem = {
  label: string;
  /** Satu kalimat yang menjelaskan menu ini melakukan apa, ditampilkan di
   * bawah labelnya. Label sependek "Validator" atau "CRM" tidak memberi tahu
   * apa pun ke orang yang belum pernah memakai alat sejenis. */
  desc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  flag?: string;
  planFeature?: keyof PlanFeatures;
  /** For shortcut items that share a destination with another item in a
   * different group (e.g. "Sambung WhatsApp" -> /dashboard/settings, same
   * page as "Pengaturan"). Without this, landing on that page would
   * highlight both nav items — in two different section colors — at once. */
  skipActiveHighlight?: boolean;
};

// Dikelompokkan berurutan cara pakainya, DAN per-channel untuk grup kirim/respons
// (mulai -> tools WhatsApp -> tools Email -> kelola -> akun) — supaya user baru tidak
// nyasar di menu datar, dan jelas mana tool yang jalan lewat WhatsApp vs Email.
// Tiap grup punya warna sendiri (lihat section-tone.ts) supaya user langsung tahu
// "sedang di area mana" tanpa baca label — Mulai=kuning (anchor), Akun=netral.
export const navGroups: { label: string; tone: SectionTone; items: NavItem[] }[] = [
  {
    label: "Mulai",
    tone: "primary",
    items: [
      { label: "Ringkasan", desc: "Angka penting dan langkah berikutnya", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Cari Calon Pembeli",
    tone: "email",
    items: [
      { label: "Cari Bisnis di Maps", desc: "Ambil nama dan nomor bisnis dari Google Maps", href: "/dashboard/scraper", icon: Search, flag: "scraper" },
      { label: "Daftar Kontak", desc: "Semua calon pembeli yang sudah tersimpan", href: "/dashboard/contacts", icon: Users, flag: "contacts" },
      { label: "Cek Nomor WhatsApp", desc: "Pastikan nomor aktif sebelum dikirimi", href: "/dashboard/validator", icon: ShieldCheck, flag: "validator", planFeature: "waValidation" },
      { label: "Temukan Alamat Email", desc: "Cari email dari website bisnis", href: "/dashboard/email-finder", icon: UserSearch, flag: "emailFinder", planFeature: "emailBlast" },
    ],
  },
  {
    label: "Kirim Pesan",
    tone: "whatsapp",
    items: [
      { label: "Kirim Pesan WhatsApp", desc: "Satu pesan ke banyak kontak sekaligus", href: "/dashboard/campaigns", icon: Megaphone, flag: "campaigns", planFeature: "campaigns" },
      { label: "Kirim Email Massal", desc: "Satu email ke banyak kontak sekaligus", href: "/dashboard/email-blast", icon: Mail, flag: "emailBlast", planFeature: "emailBlast" },
      { label: "Pesan Susulan", desc: "Kirim otomatis kalau belum dibalas", href: "/dashboard/follow-ups", icon: MessageSquareText, flag: "followUps", planFeature: "autoFollowUp" },
      { label: "Contoh Pesan", desc: "Simpan pesan yang sering dipakai", href: "/dashboard/templates", icon: FileText, flag: "templates" },
    ],
  },
  {
    label: "Balas & Catat",
    tone: "kelola",
    items: [
      { label: "Pesan Masuk", desc: "Balasan dari calon pembeli masuk ke sini", href: "/dashboard/inbox", icon: Inbox, flag: "inbox", planFeature: "inbox" },
      { label: "Peluang Penjualan", desc: "Lacak calon pembeli sampai jadi closing", href: "/dashboard/crm", icon: SquareKanban, flag: "crm", planFeature: "crmPipeline" },
      { label: "Daftar Tugas", desc: "Catatan pekerjaan yang harus dikerjakan", href: "/dashboard/tasks", icon: CheckCircle2, flag: "tasks" },
      { label: "Laporan", desc: "Hasil penjualan dan performa pengiriman", href: "/dashboard/analytics", icon: BarChart3, flag: "analytics" },
    ],
  },
  {
    label: "Akun",
    tone: "akun",
    items: [
      { label: "Tagihan & Kredit", desc: "Paket langganan dan sisa kredit", href: "/dashboard/billing", icon: CreditCard, flag: "billing" },
      { label: "Anggota Tim", desc: "Tambah rekan kerja ke workspace ini", href: "/dashboard/team", icon: Bot, flag: "team" },
      { label: "Bantuan", desc: "Pertanyaan umum dan kirim keluhan", href: "/dashboard/support", icon: Headphones, flag: "support" },
      // Dulu ada dua tujuan menuju halaman ini: "Sambungkan Nomor" di grup
      // WhatsApp dan "Pengaturan" di sini. Satu halaman dengan dua nama di dua
      // tempat justru membuat orang ragu keduanya sama atau beda.
      { label: "Pengaturan", desc: "Sambungkan nomor WhatsApp, profil, dan keamanan", href: "/dashboard/settings", icon: Settings, flag: "settings" },
    ],
  },
];

/**
 * Halaman yang TIDAK punya tempat di menu, beserta area tempatnya bernaung.
 *
 * "Pasang Ekstensi" dipakai sekali seumur pemakaian lalu tidak pernah dibuka
 * lagi, jadi ia tidak layak menempati ruang menu permanen; jalan masuknya dari
 * langkah 1 panduan alur di Ringkasan dan dari Pengaturan. "Impor Kontak"
 * memang selalu dibuka lewat tombol di halaman Daftar Kontak.
 */
export const offNavSections: Record<string, { group: string; tone: SectionTone }> = {
  "/dashboard/setup": { group: "Mulai", tone: "primary" },
  "/dashboard/contacts/import": { group: "Cari Calon Pembeli", tone: "email" },
};

/** Area tempat sebuah halaman berada — dipakai kepala halaman supaya judulnya
 * selalu cocok dengan menu yang membawanya ke sana, tanpa tiap halaman perlu
 * menuliskannya ulang. */
export function sectionForPath(pathname: string): { group: string; tone: SectionTone } {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isNavActive(pathname, item.href) && !item.skipActiveHighlight) {
        return { group: group.label, tone: group.tone };
      }
    }
  }
  for (const [href, section] of Object.entries(offNavSections)) {
    if (isNavActive(pathname, href)) return section;
  }
  return { group: navGroups[0].label, tone: navGroups[0].tone };
}

export function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
      { label: "Pasang Ekstensi", desc: "Panduan pasang alat di browser Chrome", href: "/dashboard/setup", icon: Chrome },
      { label: "Daftar Kontak", desc: "Semua calon pembeli yang sudah tersimpan", href: "/dashboard/contacts", icon: Users, flag: "contacts" },
      { label: "Cari Bisnis di Maps", desc: "Ambil nama dan nomor bisnis dari Google Maps", href: "/dashboard/scraper", icon: Search, flag: "scraper" },
    ],
  },
  {
    label: "WhatsApp",
    tone: "whatsapp",
    items: [
      { label: "Sambungkan Nomor", desc: "Hubungkan nomor WhatsApp untuk mengirim", href: "/dashboard/settings", icon: Smartphone, flag: "settings", skipActiveHighlight: true },
      { label: "Kirim Pesan Massal", desc: "Kirim satu pesan ke banyak kontak sekaligus", href: "/dashboard/campaigns", icon: Megaphone, flag: "campaigns", planFeature: "campaigns" },
      { label: "Pesan Masuk", desc: "Balasan dari calon pembeli masuk ke sini", href: "/dashboard/inbox", icon: Inbox, flag: "inbox", planFeature: "inbox" },
      { label: "Pesan Susulan", desc: "Kirim otomatis kalau belum dibalas", href: "/dashboard/follow-ups", icon: MessageSquareText, flag: "followUps", planFeature: "autoFollowUp" },
      { label: "Cek Nomor WhatsApp", desc: "Pastikan nomor aktif sebelum dikirimi", href: "/dashboard/validator", icon: ShieldCheck, flag: "validator", planFeature: "waValidation" },
      { label: "Contoh Pesan", desc: "Simpan pesan yang sering dipakai", href: "/dashboard/templates", icon: FileText, flag: "templates" },
    ],
  },
  {
    label: "Email",
    tone: "email",
    items: [
      { label: "Temukan Alamat Email", desc: "Cari email dari website bisnis", href: "/dashboard/email-finder", icon: UserSearch, flag: "emailFinder", planFeature: "emailBlast" },
      { label: "Kirim Email Massal", desc: "Kirim email ke banyak kontak sekaligus", href: "/dashboard/email-blast", icon: Mail, flag: "emailBlast", planFeature: "emailBlast" },
    ],
  },
  {
    label: "Kelola",
    tone: "kelola",
    items: [
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
      { label: "Pengaturan", desc: "Nomor WhatsApp, profil, dan keamanan", href: "/dashboard/settings", icon: Settings, flag: "settings" },
    ],
  },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

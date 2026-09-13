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

export type NavTab = {
  label: string;
  href: string;
  flag?: string;
  planFeature?: keyof PlanFeatures;
};

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
  /**
   * Halaman-halaman yang isinya satu pekerjaan yang sama, digabung jadi satu
   * menu dengan tab di dalam halaman. Tab pertama adalah halaman utamanya.
   *
   * Dulu tiap halaman punya menunya sendiri: "Kirim Pesan WhatsApp", "Kirim
   * Email Massal", "Pesan Susulan", dan "Contoh Pesan" berdiri sebagai empat
   * baris berbeda, padahal keempatnya satu pekerjaan — mengirim pesan. Delapan
   * belas menu memaksa orang menghafal peta, bukan alur kerja.
   */
  tabs?: NavTab[];
};

// Dikelompokkan berurutan cara pakainya (mulai -> cari -> kirim -> balas ->
// akun) supaya user baru tidak nyasar di menu datar. Tiap grup punya warna
// sendiri (lihat section-tone.ts) supaya user langsung tahu "sedang di area
// mana" tanpa baca label — Mulai=kuning (anchor), Akun=netral.
//
// Menu tingkat atas sengaja ditahan di angka sepuluh. Pekerjaan yang sama
// dikumpulkan jadi satu menu bertab, bukan dipecah jadi beberapa baris menu:
// yang perlu diingat orang adalah "saya mau kirim pesan", bukan "kirim pesan
// WhatsApp ada di menu ketiga, contoh pesannya di menu keenam".
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
      {
        label: "Daftar Kontak",
        desc: "Semua calon pembeli, plus cek nomor dan cari emailnya",
        href: "/dashboard/contacts",
        icon: Users,
        flag: "contacts",
        tabs: [
          { label: "Daftar Kontak", href: "/dashboard/contacts", flag: "contacts" },
          { label: "Cek Nomor WhatsApp", href: "/dashboard/validator", flag: "validator", planFeature: "waValidation" },
          { label: "Temukan Alamat Email", href: "/dashboard/email-finder", flag: "emailFinder", planFeature: "emailBlast" },
        ],
      },
    ],
  },
  {
    label: "Kirim Pesan",
    tone: "whatsapp",
    items: [
      {
        label: "Kirim Pesan",
        desc: "Kirim WhatsApp atau email ke banyak kontak sekaligus",
        href: "/dashboard/campaigns",
        icon: Megaphone,
        flag: "campaigns",
        planFeature: "campaigns",
        tabs: [
          { label: "WhatsApp", href: "/dashboard/campaigns", flag: "campaigns", planFeature: "campaigns" },
          { label: "Email", href: "/dashboard/email-blast", flag: "emailBlast", planFeature: "emailBlast" },
          { label: "Pesan Susulan", href: "/dashboard/follow-ups", flag: "followUps", planFeature: "autoFollowUp" },
          { label: "Contoh Pesan", href: "/dashboard/templates", flag: "templates" },
        ],
      },
    ],
  },
  {
    label: "Balas & Catat",
    tone: "kelola",
    items: [
      { label: "Pesan Masuk", desc: "Balasan dari calon pembeli masuk ke sini", href: "/dashboard/inbox", icon: Inbox, flag: "inbox", planFeature: "inbox" },
      {
        label: "Peluang Penjualan",
        desc: "Lacak calon pembeli sampai closing, lengkap dengan tugasnya",
        href: "/dashboard/crm",
        icon: SquareKanban,
        flag: "crm",
        planFeature: "crmPipeline",
        tabs: [
          { label: "Papan Peluang", href: "/dashboard/crm", flag: "crm", planFeature: "crmPipeline" },
          { label: "Daftar Tugas", href: "/dashboard/tasks", flag: "tasks" },
        ],
      },
      { label: "Laporan", desc: "Hasil penjualan dan performa pengiriman", href: "/dashboard/analytics", icon: BarChart3, flag: "analytics" },
    ],
  },
  {
    label: "Akun",
    tone: "akun",
    items: [
      { label: "Tagihan & Kredit", desc: "Paket langganan dan sisa kredit", href: "/dashboard/billing", icon: CreditCard, flag: "billing" },
      {
        label: "Pengaturan",
        desc: "Nomor WhatsApp, profil workspace, keamanan, dan anggota tim",
        href: "/dashboard/settings",
        icon: Settings,
        flag: "settings",
        tabs: [
          { label: "Pengaturan", href: "/dashboard/settings", flag: "settings" },
          { label: "Anggota Tim", href: "/dashboard/team", flag: "team" },
        ],
      },
      { label: "Bantuan", desc: "Pertanyaan umum dan kirim keluhan", href: "/dashboard/support", icon: Headphones, flag: "support" },
    ],
  },
];

/** Tab yang benar-benar boleh tampil: yang fiturnya tidak dimatikan owner. */
export function visibleTabs(item: NavItem, flags?: Record<string, boolean> | null): NavTab[] {
  return (item.tabs ?? []).filter((t) => !t.flag || flags?.[t.flag] !== false);
}

/**
 * Menu tampil kalau minimal satu tabnya tampil — bukan kalau flag menu
 * induknya hidup. Tanpa ini, mematikan "campaigns" ikut mengubur Email Massal
 * dan Contoh Pesan yang masih menyala, dan halamannya jadi tidak bisa dicapai
 * dari mana pun.
 */
export function navItemVisible(item: NavItem, flags?: Record<string, boolean> | null): boolean {
  if (item.tabs?.length) return visibleTabs(item, flags).length > 0;
  return !item.flag || flags?.[item.flag] !== false;
}

/** Tujuan menu: tab pertama yang masih tampil. */
export function navItemHref(item: NavItem, flags?: Record<string, boolean> | null): string {
  if (!item.tabs?.length) return item.href;
  return visibleTabs(item, flags)[0]?.href ?? item.href;
}

/**
 * Menu terkunci hanya kalau SEMUA tab yang tampil terkunci. Menu "Kirim Pesan"
 * memayungi WhatsApp, Email, Susulan, dan Contoh Pesan; mengunci seluruh menu
 * karena paketnya tidak punya blast WhatsApp akan ikut mengunci Contoh Pesan
 * yang sebenarnya gratis untuk semua paket.
 */
export function navItemLocked(
  item: NavItem,
  flags?: Record<string, boolean> | null,
  planFeatures?: PlanFeatures,
): boolean {
  if (!planFeatures) return false;
  const tabs = visibleTabs(item, flags);
  if (tabs.length) return tabs.every((t) => t.planFeature && planFeatures[t.planFeature] === false);
  return Boolean(item.planFeature && planFeatures[item.planFeature] === false);
}

/** Menu ini yang sedang dibuka? Termasuk kalau yang dibuka salah satu tabnya. */
export function navItemMatches(pathname: string, item: NavItem): boolean {
  if (isNavActive(pathname, item.href)) return true;
  return (item.tabs ?? []).some((t) => isNavActive(pathname, t.href));
}

/** Tab untuk halaman yang sedang dibuka — dipakai kepala halaman. */
export function tabsForPath(pathname: string): NavTab[] | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.tabs?.length && navItemMatches(pathname, item)) return item.tabs;
    }
  }
  return null;
}

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
      if (navItemMatches(pathname, item)) {
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

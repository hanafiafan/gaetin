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
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  SquareKanban,
  Tag,
  UserSearch,
  Users,
} from "lucide-react";
import type { PlanFeatures } from "@/config/plans";
import type { SectionTone } from "@/components/dashboard/section-tone";

export type NavItem = {
  label: string;
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
      { label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
      { label: "Setup Ekstensi", href: "/dashboard/setup", icon: Chrome },
      { label: "Kontak", href: "/dashboard/contacts", icon: Users, flag: "contacts" },
      { label: "Scraper", href: "/dashboard/scraper", icon: Search, flag: "scraper" },
    ],
  },
  {
    label: "WhatsApp",
    tone: "whatsapp",
    items: [
      { label: "Sambung WhatsApp", href: "/dashboard/settings", icon: Smartphone, flag: "settings", skipActiveHighlight: true },
      { label: "Blast", href: "/dashboard/blast", icon: Send, flag: "blast", planFeature: "blast" },
      { label: "Kampanye", href: "/dashboard/campaigns", icon: Megaphone, flag: "campaigns", planFeature: "campaigns" },
      { label: "Inbox", href: "/dashboard/inbox", icon: Inbox, flag: "inbox", planFeature: "inbox" },
      { label: "Follow-up", href: "/dashboard/follow-ups", icon: MessageSquareText, flag: "followUps", planFeature: "autoFollowUp" },
      { label: "Validator", href: "/dashboard/validator", icon: ShieldCheck, flag: "validator", planFeature: "waValidation" },
      { label: "Templates", href: "/dashboard/templates", icon: FileText, flag: "templates" },
    ],
  },
  {
    label: "Email",
    tone: "email",
    items: [
      { label: "Cari Email", href: "/dashboard/email-finder", icon: UserSearch, flag: "emailFinder", planFeature: "emailBlast" },
      { label: "Kelola Email", href: "/dashboard/email-contacts", icon: Tag, flag: "emailFinder", planFeature: "emailBlast" },
      { label: "Email Blast", href: "/dashboard/email-blast", icon: Mail, flag: "emailBlast", planFeature: "emailBlast" },
    ],
  },
  {
    label: "Kelola",
    tone: "kelola",
    items: [
      { label: "CRM", href: "/dashboard/crm", icon: SquareKanban, flag: "crm", planFeature: "crmPipeline" },
      { label: "Tugas", href: "/dashboard/tasks", icon: CheckCircle2, flag: "tasks" },
      { label: "Laporan", href: "/dashboard/analytics", icon: BarChart3, flag: "analytics" },
    ],
  },
  {
    label: "Akun",
    tone: "akun",
    items: [
      { label: "Tagihan", href: "/dashboard/billing", icon: CreditCard, flag: "billing" },
      { label: "Tim", href: "/dashboard/team", icon: Bot, flag: "team" },
      { label: "Bantuan", href: "/dashboard/support", icon: Headphones, flag: "support" },
      { label: "Pengaturan", href: "/dashboard/settings", icon: Settings, flag: "settings" },
    ],
  },
];

export function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

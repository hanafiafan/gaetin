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
  Map,
  Megaphone,
  MessageSquareText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  SquareKanban,
  UserSearch,
  Users,
} from "lucide-react";
import type { PlanFeatures } from "@/config/plans";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  flag?: string;
  planFeature?: keyof PlanFeatures;
};

// Dikelompokkan berurutan cara pakainya, DAN per-channel untuk grup kirim/respons
// (mulai -> tools WhatsApp -> tools Email -> kelola -> akun) — supaya user baru tidak
// nyasar di menu datar, dan jelas mana tool yang jalan lewat WhatsApp vs Email.
export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Mulai",
    items: [
      { label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
      { label: "Setup Ekstensi", href: "/dashboard/setup", icon: Chrome },
      { label: "Kontak", href: "/dashboard/contacts", icon: Users, flag: "contacts" },
      { label: "Scraper", href: "/dashboard/scraper", icon: Search, flag: "scraper" },
      { label: "Maps", href: "/dashboard/map", icon: Map, flag: "betaMapAnalysis" },
    ],
  },
  {
    label: "WhatsApp",
    items: [
      { label: "Sambung WhatsApp", href: "/dashboard/settings", icon: Smartphone, flag: "settings" },
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
    items: [
      { label: "Cari Email", href: "/dashboard/email-finder", icon: UserSearch, flag: "emailFinder", planFeature: "emailBlast" },
      { label: "Email Blast", href: "/dashboard/email-blast", icon: Mail, flag: "emailBlast", planFeature: "emailBlast" },
    ],
  },
  {
    label: "Kelola",
    items: [
      { label: "CRM", href: "/dashboard/crm", icon: SquareKanban, flag: "crm", planFeature: "crmPipeline" },
      { label: "Tugas", href: "/dashboard/tasks", icon: CheckCircle2, flag: "tasks" },
      { label: "Laporan", href: "/dashboard/analytics", icon: BarChart3, flag: "analytics" },
    ],
  },
  {
    label: "Akun",
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

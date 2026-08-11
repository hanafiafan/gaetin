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
  Map,
  Megaphone,
  MessageSquareText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  SquareKanban,
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

// Dikelompokkan berurutan cara pakainya (mulai -> kirim & respons -> kelola -> akun),
// bukan berdasar kategori fitur — supaya user baru tidak nyasar di menu datar.
export const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Mulai",
    items: [
      { label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
      { label: "Sambung WhatsApp", href: "/dashboard/settings", icon: Smartphone, flag: "settings" },
      { label: "Setup Ekstensi", href: "/dashboard/setup", icon: Chrome },
      { label: "Kontak", href: "/dashboard/contacts", icon: Users, flag: "contacts" },
      { label: "Scraper", href: "/dashboard/scraper", icon: Search, flag: "scraper" },
      { label: "Maps", href: "/dashboard/map", icon: Map, flag: "map" },
    ],
  },
  {
    label: "Kirim & Respons",
    items: [
      { label: "Blast", href: "/dashboard/blast", icon: Send, flag: "blast", planFeature: "blast" },
      { label: "Kampanye", href: "/dashboard/campaigns", icon: Megaphone, flag: "campaigns", planFeature: "campaigns" },
      { label: "CRM", href: "/dashboard/crm", icon: SquareKanban, flag: "crm", planFeature: "crmPipeline" },
      { label: "Inbox", href: "/dashboard/inbox", icon: Inbox, flag: "inbox", planFeature: "inbox" },
      { label: "Follow-up", href: "/dashboard/follow-ups", icon: MessageSquareText, flag: "followUps", planFeature: "autoFollowUp" },
    ],
  },
  {
    label: "Kelola",
    items: [
      { label: "Tugas", href: "/dashboard/tasks", icon: CheckCircle2, flag: "tasks" },
      { label: "Laporan", href: "/dashboard/analytics", icon: BarChart3, flag: "analytics" },
      { label: "Templates", href: "/dashboard/templates", icon: FileText, flag: "templates" },
      { label: "Validator", href: "/dashboard/validator", icon: ShieldCheck, flag: "validator", planFeature: "waValidation" },
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

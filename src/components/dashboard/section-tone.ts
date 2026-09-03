/**
 * One color identity per sidebar nav group — shared between nav-config (which
 * group owns which tone), Sidebar/MobileNav (active/hover highlight), and
 * PageHero (kicker badge + header accent), so a page's color always matches
 * the nav item that led there.
 */
export type SectionTone = "primary" | "whatsapp" | "email" | "kelola" | "akun";

export const TONE_BG: Record<SectionTone, string> = {
  primary: "bg-primary text-primary-foreground",
  whatsapp: "bg-whatsapp text-whatsapp-foreground",
  email: "bg-email text-email-foreground",
  kelola: "bg-kelola text-kelola-foreground",
  akun: "bg-foreground text-background",
};

export const TONE_BORDER: Record<SectionTone, string> = {
  primary: "border-foreground",
  whatsapp: "border-whatsapp",
  email: "border-email",
  kelola: "border-kelola",
  akun: "border-foreground",
};

export const TONE_TEXT: Record<SectionTone, string> = {
  primary: "text-primary",
  whatsapp: "text-whatsapp",
  email: "text-email",
  kelola: "text-kelola",
  akun: "text-foreground",
};

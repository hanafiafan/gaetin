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
  // Yellow is a fill color, never text-on-white (near-unreadable at this
  // lightness) — the "Mulai" identity already shows up via solid-yellow
  // badges/active-nav-state elsewhere, so its plain-text form falls back to
  // foreground instead of repeating the same contrast bug those fills exist
  // to avoid.
  primary: "text-foreground",
  whatsapp: "text-whatsapp",
  email: "text-email",
  kelola: "text-kelola",
  akun: "text-foreground",
};

/** A light tint of the section color for icon boxes/badges in page bodies —
 * everywhere defaulted to plain grey (bg-muted) regardless of which section
 * it belonged to, which is a real source of pages reading as "polos" (plain)
 * even after the header picked up its color. Primary keeps a genuine yellow
 * tint here (unlike TONE_TEXT) because a background tint isn't a contrast
 * problem the way solid yellow text is. */
export const TONE_SOFT: Record<SectionTone, string> = {
  primary: "bg-primary/15 text-foreground",
  whatsapp: "bg-whatsapp/10 text-whatsapp",
  email: "bg-email/10 text-email",
  kelola: "bg-kelola/10 text-kelola",
  akun: "bg-muted text-foreground",
};

/** Same idea as TONE_SOFT, but sized for a full-width section wash (PageHero
 * background) rather than a small icon chip — a touch stronger so it reads
 * as real color instead of disappearing next to the page's mostly-white body. */
export const TONE_WASH: Record<SectionTone, string> = {
  primary: "bg-primary/[0.08]",
  whatsapp: "bg-whatsapp/[0.07]",
  email: "bg-email/[0.07]",
  kelola: "bg-kelola/[0.07]",
  akun: "bg-muted/50",
};

/** TONE_TEXT tuned for white backgrounds; whatsapp/email/kelola's dark, saturated
 * hues lose too much contrast read as plain text on a black surface (the sidebar).
 * This is the same identity, lifted lighter so it stays legible there. Primary can
 * go full yellow-on-black here — the illegible case TONE_TEXT.primary avoids is
 * yellow-on-*white*, not yellow-on-black, which is the classic legible pairing. */
export const TONE_TEXT_DARK: Record<SectionTone, string> = {
  primary: "text-primary",
  whatsapp: "text-[#4ade80]",
  email: "text-[#60a5fa]",
  kelola: "text-[#c084fc]",
  akun: "text-foreground",
};

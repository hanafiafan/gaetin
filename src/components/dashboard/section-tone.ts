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

/** Action-card treatment: the section color reduced to a top edge over a
 * normal card, instead of flooding the whole tile. A row of four saturated
 * fills gave every card identical weight, so nothing read as the place to
 * start — and it left three more competing yellows next to the real CTA. */
export const TONE_EDGE: Record<SectionTone, string> = {
  primary: "border-t-primary",
  whatsapp: "border-t-whatsapp",
  email: "border-t-email",
  kelola: "border-t-kelola",
  akun: "border-t-foreground",
};

/* ── Tangga permukaan ───────────────────────────────────────────────────────
   Nilai-nilai ini disetel untuk tema gelap area kerja (lihat .cg-workspace di
   globals.css). Semuanya berupa rona di atas dasar near-black, jadi angka
   yang lebih besar berarti lebih terang, bukan lebih gelap:

     WASH   pita hero          — paling kuat, identitas seksi dari jauh
     PANEL  container pendukung — ringkasan, tips, sisi kanan
     CANVAS dasar halaman      — rona paling tipis
     CARD   permukaan kartu    — dipasang ke --card lewat SectionCanvas

   Kalau tema terang dipulihkan, seluruh angka di blok ini perlu dibalik. */

/** Dasar halaman — rona paling tipis di atas near-black. */
export const TONE_CANVAS: Record<SectionTone, string> = {
  primary: "bg-primary/[0.05]",
  whatsapp: "bg-whatsapp/[0.05]",
  email: "bg-email/[0.05]",
  kelola: "bg-kelola/[0.05]",
  akun: "bg-muted/25",
};

/** Container pendukung — ronanya lebih kuat dari kanvas sehingga terbaca
 * sebagai lapisan tersendiri, tapi masih di bawah pita hero. */
export const TONE_PANEL: Record<SectionTone, string> = {
  primary: "bg-primary/[0.08]",
  whatsapp: "bg-whatsapp/[0.08]",
  email: "bg-email/[0.08]",
  kelola: "bg-kelola/[0.08]",
  akun: "bg-muted/40",
};

/**
 * Warna permukaan kartu, sebagai nilai HSL mentah karena dipasang ke variabel
 * `--card` lewat SectionCanvas — bukan kelas Tailwind. Menyetel variabelnya
 * membuat SETIAP kartu di seksi itu ikut berona sekaligus (cg-card, komponen
 * Card, apa pun yang memakai bg-card), tanpa perlu menyunting belasan halaman
 * satu per satu.
 *
 * Sedikit lebih terang dari dasar halaman supaya kartu terbaca terangkat.
 * Input memakai bg-background yang lebih gelap, jadi kolom isian terbaca
 * cekung di dalam kartunya.
 */
export const TONE_CARD: Record<SectionTone, string> = {
  primary: "78 14% 12%",
  whatsapp: "142 14% 12%",
  email: "214 18% 12.5%",
  kelola: "265 16% 13%",
  akun: "222 12% 12%",
};

/** Pita hero — tingkat paling pekat, menandai identitas seksi dari jauh. */
export const TONE_WASH: Record<SectionTone, string> = {
  primary: "bg-primary/[0.14]",
  whatsapp: "bg-whatsapp/[0.14]",
  email: "bg-email/[0.14]",
  kelola: "bg-kelola/[0.14]",
  akun: "bg-muted/60",
};

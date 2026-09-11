/**
 * One color identity per sidebar nav group — shared between nav-config (which
 * group owns which tone), Sidebar/MobileNav (active/hover highlight), and
 * PageHero (kicker badge + header accent), so a page's color always matches
 * the nav item that led there.
 */
export type SectionTone = "primary" | "whatsapp" | "email" | "kelola" | "akun";

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

/** Titik kecil penanda seksi di judul halaman. Menggantikan wash selebar
 * bidang: identitas seksi tetap terbaca tanpa mewarnai seluruh permukaan,
 * yang membuat kartu dan latar sama-sama keruh. */
export const TONE_DOT: Record<SectionTone, string> = {
  primary: "bg-primary",
  whatsapp: "bg-whatsapp",
  email: "bg-email",
  kelola: "bg-kelola",
  akun: "bg-muted-foreground",
};

/**
 * Pita tipis di tepi atas kartu — cara kartu membawa warna areanya.
 *
 * Ini percobaan KETIGA untuk "bikin lebih berwarna", dan dua yang pertama
 * gagal karena alasan yang sama: warnanya membanjiri bidang. Baris berpelangi
 * di tabel kontak dan wash selebar kartu sama-sama membuat permukaan keruh dan
 * menghilangkan hierarki.
 *
 * Yang dipakai sekarang: permukaan tetap putih netral, warnanya hanya 3px di
 * tepi atas. Cukup untuk membedakan area sekali lihat, tidak cukup untuk
 * merusak keterbacaan isinya. Karena posisinya selalu sama di setiap kartu,
 * variasi warnanya tetap terbaca sebagai satu sistem.
 */
export const TONE_TOP: Record<SectionTone, string> = {
  primary: "border-t-[3px] border-t-primary",
  whatsapp: "border-t-[3px] border-t-whatsapp",
  email: "border-t-[3px] border-t-email",
  kelola: "border-t-[3px] border-t-kelola",
  akun: "border-t-[3px] border-t-foreground/35",
};

/* Empat peta permukaan berona (CANVAS, PANEL, CARD, WASH) dihapus di sini.
   Semuanya menaruh rona seksi di seluruh bidang; hasilnya kartu dan latar
   sama-sama keruh dan tidak ada lapisan yang terbaca. Referensinya memakai
   permukaan netral dengan satu aksen, dan identitas seksi cukup lewat
   TONE_DOT / TONE_SOFT / TONE_TEXT di atas. */

// Cari email publik dari website bisnis (Google Maps/Places tidak pernah menyediakan
// email langsung, jadi ini mengunjungi website lead-nya sendiri).
// Sengaja tanpa Playwright/Puppeteer — fetch HTML mentah + regex saja, biar ringan
// untuk VPS kecil. Upgrade path kalau banyak situs butuh render JS: worker terpisah
// dengan browser headless, bukan di proses utama.

import { fetchPublicHtml } from "./public-html";

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Domain placeholder/junk yang sering ke-scrape dari script pihak ketiga, bukan email asli bisnis.
const IGNORED_DOMAINS = [
  "example.com",
  "sentry.io",
  "wixpress.com",
  "godaddy.com",
  "schema.org",
  "w3.org",
  "gstatic.com",
  "google.com",
  "your-email.com",
  "email.com",
];

const CONTACT_PATHS = ["", "/contact", "/contact-us", "/kontak", "/hubungi-kami", "/about", "/tentang-kami"];
const FETCH_TIMEOUT_MS = 5000;
const MAX_HTML_BYTES = 500_000; // jangan baca seluruh halaman kalau raksasa

function isJunkEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return /\.(png|jpe?g|gif|webp|svg|woff2?|css|js)$/i.test(domain) || IGNORED_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`));
}

export function extractFirstValidEmail(html: string): string | null {
  const matches = html.match(EMAIL_RE);
  if (!matches) return null;
  for (const raw of matches) {
    const email = raw.toLowerCase();
    if (!isJunkEmail(email)) return email;
  }
  return null;
}

function normalizeWebsiteUrl(website: string): string | null {
  try {
    const withScheme = /^https?:\/\//i.test(website) ? website : `https://${website}`;
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

/** Kunjungi beranda + beberapa halaman kontak umum, ambil email pertama yang valid. */
export async function scrapeEmailFromWebsite(website: string): Promise<string | null> {
  const base = normalizeWebsiteUrl(website);
  if (!base) return null;

  const deadline = Date.now() + 12_000;
  for (const path of CONTACT_PATHS) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    const html = await fetchPublicHtml(`${base}${path}`, Math.min(FETCH_TIMEOUT_MS, remaining), MAX_HTML_BYTES);
    if (!html) continue;
    const email = extractFirstValidEmail(html);
    if (email) return email;
  }
  return null;
}

// Konstanta & opsi cookie untuk autentikasi.
// File ini tidak mengimpor apa pun agar aman dipakai di edge runtime (middleware).

export const AUTH_COOKIE = "hellens_token";
export const IMPERSONATE_COOKIE = "hellens_impersonate";
/** Workspace yang sedang dibuka. Satu akun bisa jadi anggota beberapa
 * workspace; tanpa ini yang terbuka selalu workspace tertua — jadi orang yang
 * diundang ke workspace rekannya tidak pernah melihat undangan itu. */
export const WORKSPACE_COOKIE = "hellens_workspace";
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;
export const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 jam

export function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    domain: process.env.AUTH_COOKIE_DOMAIN || undefined,
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  };
}

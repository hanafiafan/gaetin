// Konstanta & opsi cookie untuk autentikasi.
// File ini tidak mengimpor apa pun agar aman dipakai di edge runtime (middleware).

export const AUTH_COOKIE = "gaetin_token";
export const IMPERSONATE_COOKIE = "gaetin_impersonate";
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

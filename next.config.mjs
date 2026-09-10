const isProd = process.env.NODE_ENV === "production";

// Next menyuntik script & style inline untuk hidrasi, jadi 'unsafe-inline' tidak
// bisa dihindari tanpa nonce di seluruh app — nilai CSP ini ada pada directive
// lain: object-src/base-uri menutup injeksi tag, form-action mencegah form
// dibajak untuk mengirim data keluar. Pembayaran Midtrans berupa navigasi
// halaman penuh (window.location), bukan Snap.js atau iframe, sehingga tidak
// perlu di-allowlist di sini.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // ws: hanya untuk websocket hot-reload Next saat dev; produksi tidak punya itu.
  `connect-src 'self' https:${isProd ? "" : " ws:"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Content-Security-Policy", value: csp },
          ...(isProd
            ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
            : []),
        ],
      },
    ];
  },
  async redirects() {
    return [
      // "Kelola Email" was folded back into Kontak as a filter toggle — redirect
      // the short-lived dedicated route instead of leaving it a dead link.
      { source: "/dashboard/email-contacts", destination: "/dashboard/contacts", permanent: false },
      // Blast merged into Campaign — Campaign is a strict superset (adds
      // scheduling + pause/resume over the same send pipeline). Data and API
      // routes are untouched (see commit message), only the UI/nav is merged.
      { source: "/dashboard/blast", destination: "/dashboard/campaigns", permanent: false },
    ];
  },
  experimental: {
    // Baileys & beberapa lib server-only tidak boleh dibundle ke client.
    serverComponentsExternalPackages: ["@whiskeysockets/baileys", "bullmq", "ioredis", "pino"],
    // Pastikan worker/queue tidak ikut ter-tree-shake saat build.
  },
};

export default nextConfig;

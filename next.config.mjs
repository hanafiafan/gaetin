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
        ],
      },
    ];
  },
  async redirects() {
    return [
      // "Kelola Email" was folded back into Kontak as a filter toggle — redirect
      // the short-lived dedicated route instead of leaving it a dead link.
      { source: "/dashboard/email-contacts", destination: "/dashboard/contacts", permanent: false },
    ];
  },
  experimental: {
    // Baileys & beberapa lib server-only tidak boleh dibundle ke client.
    serverComponentsExternalPackages: ["@whiskeysockets/baileys", "bullmq", "ioredis", "pino"],
    // Pastikan worker/queue tidak ikut ter-tree-shake saat build.
  },
};

export default nextConfig;

import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/admin",
        "/login",
        "/register",
        "/lupa-password",
        "/reset-password",
      ],
    },
    sitemap: "https://scraper.hellens.dev/sitemap.xml",
  };
}

import { publicMetadata } from "@/lib/public/metadata";
import type { Metadata } from "next";
import { getPublicPosts } from "@/lib/public/posts";
import Landing from "@/components/public/landing";
import { getEffectivePlans } from "@/lib/plans-store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = publicMetadata(
  "Hellens — Cari Prospek, WhatsApp & CRM",
  "Riset prospek Google Maps, temukan email bisnis, kelola WhatsApp dan tindak lanjut penjualan dalam satu workspace.",
  "/",
);
export default async function HomePage() {
  const [pricing, posts] = await Promise.all([
    getEffectivePlans(),
    getPublicPosts(),
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Hellens",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: "https://scraper.hellens.dev",
            description:
              "Riset prospek Google Maps, komunikasi WhatsApp dan email, serta pipeline CRM dalam satu workspace.",
          }),
        }}
      />
      <Landing pricing={pricing} posts={posts} />
    </>
  );
}

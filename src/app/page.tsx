import type { Metadata } from "next";
import { getPublicPosts } from "@/lib/public/posts";
import Landing from "@/components/public/landing";
import { getEffectivePlans } from "@/lib/plans-store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Hellens — Temukan peluang baru. Tumbuh bareng.",
  description:
    "Temukan prospek bisnis dari Google Maps, bangun percakapan melalui WhatsApp dan email, lalu kelola tindak lanjut dalam satu CRM.",
  alternates: { canonical: "/" },
};
export default async function HomePage() {
  const [pricing, posts] = await Promise.all([
    getEffectivePlans(),
    getPublicPosts(),
  ]);
  return <Landing pricing={pricing} posts={posts} />;
}

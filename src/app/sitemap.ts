import type { MetadataRoute } from "next";
import { getPublicPosts } from "@/lib/public/posts";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublicPosts();
  return ["/", "/blog", "/panduan", ...posts.map((p) => "/blog/" + p.slug)].map(
    (path) => ({
      url: "https://scraper.hellens.dev" + path,
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.7,
    }),
  );
}

import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import { editorialPosts } from "./editorial";

export const getPublicPosts = cache(async () => {
  const [existing, overrides] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 100,
    }),
    prisma.blogPost.findMany({
      where: { slug: { in: editorialPosts.map((post) => post.slug) } },
      select: { slug: true },
    }),
  ]);
  const slugs = new Set(overrides.map((post) => post.slug));
  return [
    ...existing
      .filter((post) => post.status === "PUBLISHED")
      .map((post) => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt ?? "",
        category: "Jurnal",
        readTime: Math.max(
          1,
          Math.ceil(post.content.split(/\s+/).length / 180),
        ),
        art: "IDEAS\nIN MOTION.",
      })),
    ...editorialPosts
      .filter((post) => !slugs.has(post.slug))
      .map(({ slug, title, excerpt, category, readTime, art }) => ({
        slug,
        title,
        excerpt,
        category,
        readTime,
        art,
      })),
  ];
});

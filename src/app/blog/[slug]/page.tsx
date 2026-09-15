import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import { editorialPosts } from "@/lib/public/editorial";
import { PublicShell } from "@/components/public/public-shell";
export const dynamic = "force-dynamic";
const findPost = cache(async (slug: string) => {
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (post)
    return post.status === "PUBLISHED"
      ? {
          title: post.title,
          excerpt: post.excerpt ?? "",
          content: post.content,
          sections: [],
          category: "Jurnal",
          readTime: Math.max(
            1,
            Math.ceil(post.content.split(/\\s+/).length / 180),
          ),
        }
      : null;
  const starter = editorialPosts.find((p) => p.slug === slug);
  return starter ? { ...starter, content: "" } : null;
});
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPost(slug);
  return {
    title: post ? post.title + " — Jurnal Hellens" : "Artikel tidak ditemukan",
    description: post?.excerpt,
    alternates: { canonical: "/blog/" + slug },
  };
}
export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) notFound();
  return (
    <PublicShell>
      <main id="main-content">
        <header className="pub-page-hero">
          <div className="pub-wrap">
            <Link className="pub-text-link" href="/blog">
              ← Semua artikel
            </Link>
            <span className="pub-eyebrow">{post.category}</span>
            <h1>{post.title}</h1>
            <p>{post.excerpt}</p>
            <div className="pub-reading-meta">
              <span>REDAKSI HELLENS</span>
              <span>{post.readTime} MENIT BACA</span>
            </div>
          </div>
        </header>
        <div className="pub-wrap">
          <article className="pub-reading">
            {post.content ? (
              <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
            ) : (
              post.sections.map((section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((p) => (
                    <p
                      key={p}
                      style={{
                        fontSize: 15,
                        lineHeight: 1.95,
                        color: "#55574f",
                        marginBottom: 22,
                      }}
                    >
                      {p}
                    </p>
                  ))}
                </section>
              ))
            )}
            <hr style={{ margin: "45px 0", borderColor: "#d4d4c9" }} />
            <h2>Ubah ide menjadi langkah pertama.</h2>
            <p>Kenali alur Hellens, lalu coba dengan kebutuhan bisnis Anda.</p>
            <Link className="pub-button pub-button-dark" href="/register">
              Mulai gratis ↗
            </Link>
          </article>
        </div>
      </main>
    </PublicShell>
  );
}

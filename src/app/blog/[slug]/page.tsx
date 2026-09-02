import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
  });
  if (!post) notFound();

  return (
    <main className="cg-section py-14">
      <Link href="/blog" className="cg-label text-muted-foreground transition hover:text-foreground">
        ← Blog
      </Link>

      <div className="mt-6 max-w-3xl border-b border-foreground pb-8">
        <h1 className="cg-display text-[clamp(2rem,5.5vw,4rem)]">{post.title}</h1>
        {post.publishedAt && (
          <p className="cg-label mt-5 text-muted-foreground">
            {new Date(post.publishedAt).toLocaleDateString("id-ID")}
          </p>
        )}
      </div>

      <article className="mt-10 max-w-2xl whitespace-pre-wrap text-[15px] leading-8 text-muted-foreground">
        {post.content}
      </article>
    </main>
  );
}

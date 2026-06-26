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
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/blog" className="text-sm text-primary hover:underline">← Blog</Link>
      <h1 className="mt-3 text-3xl font-bold">{post.title}</h1>
      {post.publishedAt && (
        <p className="mt-2 text-sm text-muted-foreground">{new Date(post.publishedAt).toLocaleDateString("id-ID")}</p>
      )}
      <article className="mt-6 whitespace-pre-wrap text-[15px] leading-7">{post.content}</article>
    </main>
  );
}

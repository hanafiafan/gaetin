import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-primary hover:underline">← Beranda</Link>
      <h1 className="mt-2 text-3xl font-bold">Blog</h1>
      <div className="mt-8 space-y-5">
        {posts.length === 0 && <p className="text-muted-foreground">Belum ada artikel.</p>}
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="block rounded-xl border bg-card p-5 hover:bg-muted/30">
            <h2 className="text-lg font-semibold">{p.title}</h2>
            {p.excerpt && <p className="mt-1 text-sm text-muted-foreground">{p.excerpt}</p>}
            {p.publishedAt && (
              <p className="mt-2 text-xs text-muted-foreground">{new Date(p.publishedAt).toLocaleDateString("id-ID")}</p>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}

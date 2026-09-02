import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  return (
    <main className="cg-section py-14">
      <Link href="/" className="cg-label text-muted-foreground transition hover:text-foreground">
        ← Beranda
      </Link>

      <h1 className="cg-display mt-6 text-[clamp(2.5rem,7vw,5rem)]">Blog</h1>

      <div className="mt-12 border-t border-foreground">
        {posts.length === 0 && (
          <p className="py-10 text-sm text-muted-foreground">Belum ada artikel.</p>
        )}
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="group flex items-start justify-between gap-6 border-b border-border py-7 transition hover:bg-muted"
          >
            <div className="min-w-0">
              <h2 className="cg-display text-2xl sm:text-3xl">{p.title}</h2>
              {p.excerpt && <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{p.excerpt}</p>}
              {p.publishedAt && (
                <p className="cg-label mt-4 text-muted-foreground">
                  {new Date(p.publishedAt).toLocaleDateString("id-ID")}
                </p>
              )}
            </div>
            <ArrowUpRight
              className="mt-1 h-6 w-6 shrink-0 text-muted-foreground transition group-hover:text-foreground"
              strokeWidth={2}
            />
          </Link>
        ))}
      </div>
    </main>
  );
}

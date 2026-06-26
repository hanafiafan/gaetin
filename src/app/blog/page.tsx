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
      <h1 className="mt-2 text-3xl font-bold text-white">Blog</h1>
      <div className="mt-8 space-y-5">
        {posts.length === 0 && <p className="text-slate-400">Belum ada artikel.</p>}
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="block rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition hover:border-white/15 hover:bg-white/[0.04]">
            <h2 className="text-lg font-semibold text-white">{p.title}</h2>
            {p.excerpt && <p className="mt-1 text-sm text-slate-400">{p.excerpt}</p>}
            {p.publishedAt && (
              <p className="mt-2 text-xs text-slate-500">{new Date(p.publishedAt).toLocaleDateString("id-ID")}</p>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import type { EditorialPost } from "@/lib/public/editorial";
type Summary = Pick<
  EditorialPost,
  "slug" | "title" | "excerpt" | "category" | "readTime" | "art"
>;
export default function JournalGrid({ posts }: { posts: Summary[] }) {
  const [category, setCategory] = useState("Semua");
  const [query, setQuery] = useState("");
  const categories = [
    "Semua",
    ...Array.from(new Set(posts.map((p) => p.category))),
  ];
  const visible = posts.filter(
    (p) =>
      (category === "Semua" || p.category === category) &&
      (
        p.title +
        " " +
        p.excerpt +
        " " +
        p.category +
        " " +
        p.slug.replaceAll("-", " ")
      )
        .toLocaleLowerCase("id")
        .includes(query.trim().toLocaleLowerCase("id")),
  );
  return (
    <>
      <div className="pub-journal-tools">
        <div className="pub-journal-filters" aria-label="Kategori artikel">
          {categories.map((c) => (
            <button
              key={c}
              aria-pressed={c === category}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="pub-journal-search">
          <Search size={17} />
          <input
            aria-label="Cari artikel"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari ide atau topik..."
          />
        </label>
      </div>
      <p className="pub-journal-count" aria-live="polite">
        {visible.length} artikel untuk dijelajahi
      </p>
      <div className="pub-article-grid">
        {visible.map((post, i) => (
          <Link
            key={post.slug}
            href={"/blog/" + post.slug}
            className="pub-article-card"
          >
            <div className={"pub-article-art art-" + (i % 4)}>
              <span>{post.art}</span>
              <ArrowUpRight />
              <small>HELLENS JOURNAL / {String(i + 1).padStart(2, "0")}</small>
            </div>
            <div className="pub-article-meta">
              {post.category}
              <span>{post.readTime} menit baca</span>
            </div>
            <h2 className="pub-journal-card-title">{post.title}</h2>
            <p>{post.excerpt}</p>
          </Link>
        ))}
      </div>
      {!visible.length && (
        <div className="pub-journal-empty">
          <h2>Belum bertemu topik yang pas.</h2>
          <p>Coba kata lain atau tampilkan kembali seluruh artikel.</p>
          <button
            className="pub-button pub-button-dark"
            onClick={() => {
              setQuery("");
              setCategory("Semua");
            }}
          >
            Tampilkan semua artikel
          </button>
        </div>
      )}
    </>
  );
}

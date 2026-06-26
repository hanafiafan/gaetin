"use client";

import { useEffect, useState } from "react";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  status: string;
}

const INPUT_CLASS = "h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none";
const TEXTAREA_CLASS = "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none";

export default function AdminBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/admin/blog");
    const j = await r.json();
    if (j.success) setPosts(j.data);
  }
  useEffect(() => { load(); }, []);

  function reset() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setStatus("DRAFT");
  }

  function editPost(p: Post) {
    setEditingId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setExcerpt(p.excerpt ?? "");
    setContent(p.content);
    setStatus(p.status);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const url = editingId ? `/api/admin/blog/${editingId}` : "/api/admin/blog";
    const method = editingId ? "PUT" : "POST";
    const payload = editingId
      ? { title, excerpt, content, status }
      : { title, slug: slug || undefined, excerpt, content, status };
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const j = await r.json();
    if (!r.ok) { setError(j?.error?.message ?? "Gagal menyimpan"); return; }
    reset();
    load();
  }

  async function remove(id: string) {
    if (!confirm("Hapus artikel?")) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    if (editingId === id) reset();
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={save} className="cg-card space-y-3 rounded-2xl p-5">
        <h2 className="font-bold text-white">{editingId ? "Edit artikel" : "Artikel baru"}</h2>
        {error && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul" className={INPUT_CLASS} />
        {!editingId && <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug-opsional" className={INPUT_CLASS} />}
        <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Ringkasan (opsional)" className={INPUT_CLASS} />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} placeholder="Isi artikel..." className={TEXTAREA_CLASS} />
        <div className="flex items-center gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2 text-sm text-white">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Publish</option>
          </select>
          <button type="submit" disabled={!title.trim() || !content.trim()} className="flex h-10 items-center rounded-full border border-primary/30 bg-primary/15 px-4 text-sm font-bold text-primary transition hover:bg-primary/25 disabled:opacity-50">
            {editingId ? "Simpan" : "Buat"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="flex h-10 items-center rounded-xl px-4 text-sm font-bold text-slate-400 transition hover:text-white">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="space-y-2">
        {posts.length === 0 && <p className="text-sm text-slate-500">Belum ada artikel.</p>}
        {posts.map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <div className="min-w-0">
              <div className="font-bold text-white">{p.title}</div>
              <div className="text-xs text-slate-500">/{p.slug} · {p.status}</div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button onClick={() => editPost(p)} className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary">Edit</button>
              <button onClick={() => remove(p.id)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 transition hover:bg-red-500/10 hover:text-red-400">Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  status: string;
}

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
  useEffect(() => {
    load();
  }, []);

  function reset() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setStatus("DRAFT");
  }

  function edit(p: Post) {
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
    if (!r.ok) {
      setError(j?.error?.message ?? "Gagal menyimpan");
      return;
    }
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
      <form onSubmit={save} className="space-y-3 rounded-lg border bg-card p-4">
        <h2 className="font-medium">{editingId ? "Edit artikel" : "Artikel baru"}</h2>
        {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul" />
        {!editingId && <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug-opsional" />}
        <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Ringkasan (opsional)" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} placeholder="Isi artikel..." className="w-full rounded-md border border-input bg-background p-3 text-sm" />
        <div className="flex items-center gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-md border border-input bg-background px-2 text-sm">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Publish</option>
          </select>
          <Button type="submit" disabled={!title.trim() || !content.trim()}>{editingId ? "Simpan" : "Buat"}</Button>
          {editingId && <Button type="button" variant="ghost" onClick={reset}>Batal</Button>}
        </div>
      </form>

      <div className="space-y-2">
        {posts.length === 0 && <p className="text-sm text-muted-foreground">Belum ada artikel.</p>}
        {posts.map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-2 rounded-lg border bg-card p-3">
            <div className="min-w-0">
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-muted-foreground">/{p.slug} · {p.status}</div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button size="sm" variant="outline" onClick={() => edit(p)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>Hapus</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

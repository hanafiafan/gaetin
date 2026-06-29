"use client";

import { useEffect, useState } from "react";
import { Eye, Plus, Trash2 } from "lucide-react";
import { renderMessage } from "@/lib/messaging/text";

interface Template {
  id: string;
  name: string;
  body: string;
}

const SAMPLE = { nama: "Budi", kota: "Jakarta", phone: "628123456789" };

export default function TemplatesClient() {
  const [items, setItems] = useState<Template[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/templates");
    const j = await r.json();
    if (j.success) setItems(j.data);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, body }),
    });
    const j = await r.json();
    if (!r.ok) { setError(j?.error?.message ?? "Gagal menyimpan template"); return; }
    setName("");
    setBody("");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Hapus template ini?")) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
      <div className="cg-card rounded-2xl p-5">
        <form onSubmit={create} className="space-y-3">
          <div>
            <h2 className="font-black text-foreground">Template baru</h2>
            <p className="mt-1 text-sm text-muted-foreground">Buat copy yang bisa dipakai ulang di blast dan campaign.</p>
          </div>
          {error && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama template"
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="Halo {{nama}}! {Promo|Penawaran} spesial untuk bisnis di {{kota}}."
            className="w-full resize-none rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
          />
          {body && (
            <div className="rounded-xl border border-border bg-card p-3 text-sm">
              <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" /> Pratinjau contoh:
              </div>
              <span className="text-slate-200">{renderMessage(body, SAMPLE)}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={!name.trim() || !body.trim()}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/15 text-sm font-bold text-primary transition hover:bg-primary/25 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Simpan template
          </button>
        </form>
      </div>

      <div className="cg-card rounded-2xl p-5">
        <div className="mb-4">
          <h2 className="font-black text-foreground">Library template</h2>
          <p className="text-sm text-muted-foreground">{items.length} template tersimpan</p>
        </div>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Belum ada template. Buat template pertama dari panel di kiri.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((t) => (
              <div key={t.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-foreground">{t.name}</p>
                  <button
                    onClick={() => remove(t.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{t.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

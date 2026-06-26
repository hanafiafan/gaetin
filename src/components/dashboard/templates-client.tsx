"use client";

import { useEffect, useState } from "react";
import { Eye, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, body }),
    });
    const j = await r.json();
    if (!r.ok) {
      setError(j?.error?.message ?? "Gagal menyimpan template");
      return;
    }
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
      <Card className="rounded-2xl shadow-sm"><CardContent className="space-y-4 p-5">
      <form onSubmit={create} className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Template baru</h2>
          <p className="mt-1 text-sm text-muted-foreground">Buat copy yang bisa dipakai ulang di blast dan campaign.</p>
        </div>
        {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama template" className="h-11" />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="Halo {{nama}}! {Promo|Penawaran} spesial untuk bisnis di {{kota}}."
          className="w-full rounded-xl border border-input bg-background p-3 text-sm"
        />
        {body && (
          <div className="rounded-xl border bg-muted/30 p-3 text-sm">
            <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground"><Eye className="h-3.5 w-3.5" /> Pratinjau contoh:</div>
            {renderMessage(body, SAMPLE)}
          </div>
        )}
        <Button type="submit" className="w-full rounded-full" disabled={!name.trim() || !body.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          Simpan template
        </Button>
      </form>
      </CardContent></Card>

      <Card className="rounded-2xl shadow-sm"><CardContent className="space-y-3 p-5">
        <div>
          <h2 className="text-lg font-semibold">Library template</h2>
          <p className="text-sm text-muted-foreground">{items.length} template tersimpan</p>
        </div>
        {items.length === 0 && <p className="text-sm text-muted-foreground">Belum ada template.</p>}
        {items.map((t) => (
          <div key={t.id} className="rounded-2xl border bg-background p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="font-medium">{t.name}</div>
              <Button size="sm" variant="ghost" onClick={() => remove(t.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{t.body}</p>
          </div>
        ))}
      </CardContent></Card>
    </div>
  );
}

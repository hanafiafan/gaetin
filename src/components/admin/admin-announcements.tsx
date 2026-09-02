"use client";

import { useEffect, useState } from "react";

interface Ann {
  id: string;
  message: string;
  type: string;
  active: boolean;
}

const INPUT_CLASS = "h-10 min-w-[260px] flex-1 rounded-xl border border-border bg-muted px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none";
const SELECT_CLASS = "h-10 rounded-xl border border-border bg-muted px-2 text-sm text-foreground";

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Ann[]>([]);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("INFO");

  async function load() {
    const r = await fetch("/api/admin/announcements");
    const j = await r.json();
    if (j.success) setItems(j.data);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, type }),
    });
    setMessage("");
    load();
  }
  async function toggle(a: Ann) {
    await fetch(`/api/admin/announcements/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !a.active }),
    });
    load();
  }
  async function remove(id: string) {
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={create} className="cg-card flex flex-wrap items-center gap-2 rounded-2xl p-4">
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Pesan pengumuman" className={INPUT_CLASS} />
        <select value={type} onChange={(e) => setType(e.target.value)} className={SELECT_CLASS}>
          <option value="INFO">Info</option>
          <option value="WARNING">Peringatan</option>
          <option value="PROMO">Promo</option>
        </select>
        <button type="submit" className="flex h-10 items-center rounded-full border border-primary/30 bg-primary/15 px-4 text-sm font-bold text-foreground transition hover:bg-primary/25">
          Tambah
        </button>
      </form>

      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Belum ada pengumuman.</p>}
        {items.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted p-3">
            <div className="min-w-0">
              <div className="truncate text-sm text-foreground">{a.message}</div>
              <div className="text-xs text-muted-foreground">{a.type} · {a.active ? "aktif" : "nonaktif"}</div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button onClick={() => toggle(a)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-foreground transition hover:border-primary/30 hover:text-foreground">
                {a.active ? "Nonaktifkan" : "Aktifkan"}
              </button>
              <button onClick={() => remove(a.id)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive">
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Ann {
  id: string;
  message: string;
  type: string;
  active: boolean;
}

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Ann[]>([]);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("INFO");

  async function load() {
    const r = await fetch("/api/admin/announcements");
    const j = await r.json();
    if (j.success) setItems(j.data);
  }
  useEffect(() => {
    load();
  }, []);

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
      <form onSubmit={create} className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-4">
        <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Pesan pengumuman" className="min-w-[260px] flex-1" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-md border border-input bg-background px-2 text-sm">
          <option value="INFO">Info</option>
          <option value="WARNING">Peringatan</option>
          <option value="PROMO">Promo</option>
        </select>
        <Button type="submit">Tambah</Button>
      </form>

      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Belum ada pengumuman.</p>}
        {items.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border bg-card p-3">
            <div className="min-w-0">
              <div className="truncate text-sm">{a.message}</div>
              <div className="text-xs text-muted-foreground">{a.type} · {a.active ? "aktif" : "nonaktif"}</div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button size="sm" variant="outline" onClick={() => toggle(a)}>{a.active ? "Nonaktifkan" : "Aktifkan"}</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(a.id)}>Hapus</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

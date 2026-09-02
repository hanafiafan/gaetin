"use client";

import { useEffect, useState } from "react";

interface U {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  locked: boolean;
}

export default function AdminUsers() {
  const [rows, setRows] = useState<U[]>([]);
  const [query, setQuery] = useState("");

  async function load() {
    const r = await fetch(`/api/admin/users${query ? `?query=${encodeURIComponent(query)}` : ""}`);
    const j = await r.json();
    if (j.success) setRows(j.data);
  }
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [query]);

  async function act(id: string, action: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    load();
  }

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari nama / email..."
        className="h-10 max-w-xs rounded-xl border border-border bg-muted px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
      />
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted text-left text-xs uppercase text-muted-foreground">
              <th className="p-3">Nama</th>
              <th className="p-3">Email</th>
              <th className="p-3 text-center">Super Admin</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted">
                <td className="p-3 font-bold text-foreground">{u.name}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3 text-center text-foreground">{u.isSuperAdmin ? "Ya" : "—"}</td>
                <td className="p-3 text-center">{u.locked ? <span className="text-destructive">Terkunci</span> : <span className="text-success">Aktif</span>}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => act(u.id, "toggleSuperAdmin")} className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-foreground transition hover:border-primary/30 hover:text-foreground">
                      {u.isSuperAdmin ? "Cabut admin" : "Jadikan admin"}
                    </button>
                    {u.locked ? (
                      <button onClick={() => act(u.id, "unlock")} className="rounded-lg border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-bold text-success transition hover:bg-success/20">
                        Buka kunci
                      </button>
                    ) : (
                      <button onClick={() => act(u.id, "lock")} className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition hover:bg-destructive/20">
                        Kunci
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Tidak ada user.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

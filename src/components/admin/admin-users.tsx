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
        className="h-10 max-w-xs rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none"
      />
      <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03] text-left text-xs uppercase text-slate-500">
              <th className="p-3">Nama</th>
              <th className="p-3">Email</th>
              <th className="p-3 text-center">Super Admin</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                <td className="p-3 font-bold text-white">{u.name}</td>
                <td className="p-3 text-slate-400">{u.email}</td>
                <td className="p-3 text-center text-slate-300">{u.isSuperAdmin ? "Ya" : "—"}</td>
                <td className="p-3 text-center">{u.locked ? <span className="text-red-400">Terkunci</span> : <span className="text-emerald-400">Aktif</span>}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => act(u.id, "toggleSuperAdmin")} className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary">
                      {u.isSuperAdmin ? "Cabut admin" : "Jadikan admin"}
                    </button>
                    {u.locked ? (
                      <button onClick={() => act(u.id, "unlock")} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20">
                        Buka kunci
                      </button>
                    ) : (
                      <button onClick={() => act(u.id, "lock")} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 transition hover:bg-red-500/20">
                        Kunci
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Tidak ada user.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

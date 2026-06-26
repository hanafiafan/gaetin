"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama / email..." className="max-w-xs" />
      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-3">Nama</th>
              <th className="p-3">Email</th>
              <th className="p-3 text-center">Super Admin</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3 text-center">{u.isSuperAdmin ? "Ya" : "—"}</td>
                <td className="p-3 text-center">{u.locked ? <span className="text-red-600">Terkunci</span> : "Aktif"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => act(u.id, "toggleSuperAdmin")}>
                      {u.isSuperAdmin ? "Cabut admin" : "Jadikan admin"}
                    </Button>
                    {u.locked ? (
                      <Button size="sm" onClick={() => act(u.id, "unlock")}>Buka kunci</Button>
                    ) : (
                      <Button size="sm" variant="destructive" onClick={() => act(u.id, "lock")}>Kunci</Button>
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

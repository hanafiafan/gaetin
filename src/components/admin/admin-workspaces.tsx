"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Ws {
  id: string;
  name: string;
  owner: string;
  plan: string;
  status: string;
  credits: number;
  contacts: number;
}

export default function AdminWorkspaces() {
  const [rows, setRows] = useState<Ws[]>([]);

  async function load() {
    const r = await fetch("/api/admin/workspaces");
    const j = await r.json();
    if (j.success) setRows(j.data);
  }
  useEffect(() => {
    load();
  }, []);

  async function act(id: string, body: Record<string, unknown>) {
    await fetch(`/api/admin/workspaces/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  function addCredits(id: string) {
    const v = window.prompt("Tambah/kurang kredit (boleh negatif):", "100");
    if (v === null) return;
    act(id, { action: "addCredits", credits: Number(v) || 0 });
  }

  async function impersonate(id: string) {
    await fetch(`/api/admin/workspaces/${id}/impersonate`, { method: "POST" });
    window.location.href = "/dashboard";
  }

  return (
    <div className="overflow-x-auto rounded-md border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="p-3">Workspace</th>
            <th className="p-3">Owner</th>
            <th className="p-3">Paket</th>
            <th className="p-3 text-center">Status</th>
            <th className="p-3 text-right">Kredit</th>
            <th className="p-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((w) => (
            <tr key={w.id} className="border-b last:border-0">
              <td className="p-3 font-medium">{w.name}<div className="text-xs text-muted-foreground">{w.contacts} kontak</div></td>
              <td className="p-3 text-muted-foreground">{w.owner}</td>
              <td className="p-3">
                <select
                  value={w.plan}
                  onChange={(e) => act(w.id, { action: "setPlan", plan: e.target.value })}
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="STARTER">Starter</option>
                  <option value="GROWTH">Bisnis</option>
                  <option value="PRO">Pro</option>
                </select>
              </td>
              <td className="p-3 text-center">{w.status}</td>
              <td className="p-3 text-right">{w.credits.toLocaleString("id-ID")}</td>
              <td className="p-3">
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="outline" onClick={() => impersonate(w.id)}>Masuk</Button>
                  <Button size="sm" variant="outline" onClick={() => addCredits(w.id)}>Kredit</Button>
                  {w.status === "BLOCKED" ? (
                    <Button size="sm" onClick={() => act(w.id, { action: "setStatus", status: "ACTIVE" })}>Aktifkan</Button>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={() => act(w.id, { action: "setStatus", status: "BLOCKED" })}>Suspend</Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Belum ada workspace.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

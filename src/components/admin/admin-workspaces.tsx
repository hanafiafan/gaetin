"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Ws {
  id: string;
  name: string;
  owner: string;
  plan: string;
  status: string;
  credits: number;
  contacts: number;
}

const SELECT_CLASS = "h-8 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-xs text-white";

export default function AdminWorkspaces() {
  const router = useRouter();
  const [rows, setRows] = useState<Ws[]>([]);

  async function load() {
    const r = await fetch("/api/admin/workspaces");
    const j = await r.json();
    if (j.success) setRows(j.data);
  }
  useEffect(() => { load(); }, []);

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
    <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.03] text-left">
            <th className="p-3 text-xs font-bold uppercase text-slate-500">Workspace</th>
            <th className="p-3 text-xs font-bold uppercase text-slate-500">Owner</th>
            <th className="p-3 text-xs font-bold uppercase text-slate-500">Paket</th>
            <th className="p-3 text-center text-xs font-bold uppercase text-slate-500">Status</th>
            <th className="p-3 text-right text-xs font-bold uppercase text-slate-500">Kredit</th>
            <th className="p-3 text-right text-xs font-bold uppercase text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((w) => (
            <tr key={w.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
              <td className="p-3 font-medium">
                <button onClick={() => router.push(`/admin/workspaces/${w.id}`)} className="text-left text-white hover:text-primary">
                  {w.name}
                </button>
                <div className="text-xs text-slate-500">{w.contacts} kontak</div>
              </td>
              <td className="p-3 text-slate-400">{w.owner}</td>
              <td className="p-3">
                <select value={w.plan} onChange={(e) => act(w.id, { action: "setPlan", plan: e.target.value })} className={SELECT_CLASS}>
                  <option value="STARTER">Starter</option>
                  <option value="GROWTH">Bisnis</option>
                  <option value="PRO">Pro</option>
                </select>
              </td>
              <td className="p-3">
                <select value={w.status} onChange={(e) => act(w.id, { action: "setStatus", status: e.target.value })} className={SELECT_CLASS}>
                  <option value="TRIAL">Trial</option>
                  <option value="ACTIVE">Aktif</option>
                  <option value="EXPIRED">Kedaluwarsa</option>
                  <option value="BLOCKED">Suspend</option>
                  <option value="CANCELLED">Batal</option>
                </select>
              </td>
              <td className="p-3 text-right text-white">{w.credits.toLocaleString("id-ID")}</td>
              <td className="p-3">
                <div className="flex justify-end gap-1">
                  <button onClick={() => router.push(`/admin/workspaces/${w.id}`)} className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary">Detail</button>
                  <button onClick={() => impersonate(w.id)} className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary">Masuk</button>
                  <button onClick={() => addCredits(w.id)} className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-white/15">Kredit</button>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={6} className="p-8 text-center text-slate-500">Belum ada workspace.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

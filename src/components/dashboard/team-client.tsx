"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "AGENT";
  isSelf: boolean;
}
interface Log {
  id: string;
  action: string;
  target: string | null;
  actor: string;
  createdAt: string;
}

const SELECT_CLASS = "h-8 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-xs text-white";

export default function TeamClient() {
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [myRole, setMyRole] = useState<string>("AGENT");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "AGENT">("AGENT");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [rm, ra, ru] = await Promise.all([fetch("/api/team"), fetch("/api/audit"), fetch("/api/auth/me")]);
    const [jm, ja, ju] = await Promise.all([rm.json(), ra.json(), ru.json()]);
    if (jm.success) setMembers(jm.data);
    if (ja.success) setLogs(ja.data);
    if (ju.success) setMyRole(ju.data.role);
  }
  useEffect(() => { load(); }, []);

  const isManager = myRole === "OWNER" || myRole === "ADMIN";

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const j = await r.json();
    if (!r.ok) { setError(j?.error?.message ?? "Gagal menambah anggota"); return; }
    setEmail("");
    load();
  }

  async function changeRole(id: string, newRole: string) {
    await fetch(`/api/team/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: newRole }) });
    load();
  }
  async function remove(id: string) {
    if (!confirm("Hapus anggota ini?")) return;
    await fetch(`/api/team/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      {isManager && (
        <form onSubmit={addMember} className="cg-card flex flex-wrap items-center gap-2 rounded-2xl p-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email anggota (sudah terdaftar)"
            className="h-10 max-w-xs flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none"
          />
          <select value={role} onChange={(e) => setRole(e.target.value as "ADMIN" | "AGENT")} className="h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2 text-sm text-white">
            <option value="AGENT">Agent</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" className="flex h-10 items-center rounded-full border border-primary/30 bg-primary/15 px-5 text-sm font-bold text-primary transition hover:bg-primary/25">
            Tambah anggota
          </button>
          {error && <span className="text-sm text-destructive">{error}</span>}
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03] text-left">
              <th className="p-3 text-xs font-bold uppercase text-slate-500">Nama</th>
              <th className="p-3 text-xs font-bold uppercase text-slate-500">Email</th>
              <th className="p-3 text-xs font-bold uppercase text-slate-500">Role</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                <td className="p-3 font-medium text-white">{m.name}{m.isSelf && <span className="ml-1 text-xs text-slate-500">(Anda)</span>}</td>
                <td className="p-3 text-slate-400">{m.email}</td>
                <td className="p-3">
                  {isManager && m.role !== "OWNER" ? (
                    <select value={m.role} onChange={(e) => changeRole(m.id, e.target.value)} className={SELECT_CLASS}>
                      <option value="ADMIN">Admin</option>
                      <option value="AGENT">Agent</option>
                    </select>
                  ) : (
                    <span className="text-slate-300">{m.role}</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  {isManager && m.role !== "OWNER" && (
                    <button onClick={() => remove(m.id)} className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs font-bold text-slate-400 transition hover:border-red-500/30 hover:text-red-400">
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="mb-2 font-bold text-white">Aktivitas terbaru</h2>
        <div className="cg-card space-y-1 rounded-2xl p-4 text-sm">
          {logs.length === 0 && <p className="text-slate-500">Belum ada aktivitas tercatat.</p>}
          {logs.map((l) => (
            <div key={l.id} className="flex justify-between border-b border-white/[0.05] py-1.5 last:border-0">
              <span className="text-slate-300">
                <span className="font-bold text-white">{l.actor}</span> · {l.action}{l.target ? ` · ${l.target}` : ""}
              </span>
              <span className="text-slate-500">{new Date(l.createdAt).toLocaleString("id-ID")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export default function TeamClient() {
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [myRole, setMyRole] = useState<string>("AGENT");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "AGENT">("AGENT");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [rm, ra, ru] = await Promise.all([
      fetch("/api/team"),
      fetch("/api/audit"),
      fetch("/api/auth/me"),
    ]);
    const [jm, ja, ju] = await Promise.all([rm.json(), ra.json(), ru.json()]);
    if (jm.success) setMembers(jm.data);
    if (ja.success) setLogs(ja.data);
    if (ju.success) setMyRole(ju.data.role);
  }
  useEffect(() => {
    load();
  }, []);

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
    if (!r.ok) {
      setError(j?.error?.message ?? "Gagal menambah anggota");
      return;
    }
    setEmail("");
    load();
  }

  async function changeRole(id: string, newRole: string) {
    await fetch(`/api/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
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
        <form onSubmit={addMember} className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-4">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email anggota (sudah terdaftar)" className="max-w-xs" />
          <select value={role} onChange={(e) => setRole(e.target.value as "ADMIN" | "AGENT")} className="h-10 rounded-md border border-input bg-background px-2 text-sm">
            <option value="AGENT">Agent</option>
            <option value="ADMIN">Admin</option>
          </select>
          <Button type="submit">Tambah anggota</Button>
          {error && <span className="text-sm text-destructive">{error}</span>}
        </form>
      )}

      <div className="overflow-hidden rounded-md border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-3">Nama</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{m.name}{m.isSelf && " (Anda)"}</td>
                <td className="p-3 text-muted-foreground">{m.email}</td>
                <td className="p-3">
                  {isManager && m.role !== "OWNER" ? (
                    <select value={m.role} onChange={(e) => changeRole(m.id, e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                      <option value="ADMIN">Admin</option>
                      <option value="AGENT">Agent</option>
                    </select>
                  ) : (
                    m.role
                  )}
                </td>
                <td className="p-3 text-right">
                  {isManager && m.role !== "OWNER" && (
                    <Button size="sm" variant="ghost" onClick={() => remove(m.id)}>Hapus</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="mb-2 font-medium">Aktivitas terbaru</h2>
        <div className="space-y-1 rounded-md border bg-card p-3 text-sm">
          {logs.length === 0 && <p className="text-muted-foreground">Belum ada aktivitas tercatat.</p>}
          {logs.map((l) => (
            <div key={l.id} className="flex justify-between border-b py-1 last:border-0">
              <span><span className="font-medium">{l.actor}</span> · {l.action}{l.target ? ` · ${l.target}` : ""}</span>
              <span className="text-muted-foreground">{new Date(l.createdAt).toLocaleString("id-ID")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

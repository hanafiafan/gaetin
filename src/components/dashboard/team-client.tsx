"use client";

import { useEffect, useState } from "react";
import { errorMessage, requestJson } from "@/lib/http/client";

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

const SELECT_CLASS = "h-10 rounded-lg border border-border bg-card px-2.5 text-sm text-foreground";

/** Nilai enum Prisma bocor ke layar sebagai "OWNER". Sisa kelas bug yang sama
 * dengan status kampanye dan percakapan; peta kecilnya di sini karena role
 * bukan status dan tidak masuk StatusBadge. */
const ROLE_LABEL: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  AGENT: "Agent",
};

export default function TeamClient() {
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [myRole, setMyRole] = useState<string>("AGENT");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "AGENT">("AGENT");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

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
    setInfo(null);
    const r = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const j = await r.json();
    if (!r.ok) { setError(j?.error?.message ?? "Gagal menambah anggota"); return; }
    // Nama yang muncul di tabel tidak berarti orangnya sudah tahu. Dia masuk
    // ke workspace-nya sendiri saat login, dan harus berpindah dulu lewat
    // nama workspace di pojok kanan atas.
    setInfo(
      j?.data?.emailSent
        ? `${email} sudah ditambahkan dan dikabari lewat email. Dia perlu masuk, lalu pilih workspace ini lewat nama workspace di pojok kanan atas.`
        : `${email} sudah ditambahkan. Kabari dia sendiri: setelah masuk, dia perlu memilih workspace ini lewat nama workspace di pojok kanan atas.`,
    );
    setEmail("");
    load();
  }

  async function changeRole(id: string, newRole: string) {
    setError(null);
    try {
      await requestJson(`/api/team/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: newRole }) }, "Gagal mengubah peran anggota");
      load();
    } catch (e) { setError(errorMessage(e, "Gagal mengubah peran anggota")); }
  }
  async function remove(id: string) {
    if (!confirm("Hapus anggota ini?")) return;
    setError(null);
    try {
      await requestJson(`/api/team/${id}`, { method: "DELETE" }, "Gagal menghapus anggota");
      load();
    } catch (e) { setError(errorMessage(e, "Gagal menghapus anggota")); }
  }

  return (
    <div className="space-y-6">
      {isManager && (
        <form onSubmit={addMember} className="cg-card cg-sheet cg-tone-top flex flex-wrap items-center gap-2 rounded-xl p-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="email anggota (sudah terdaftar)" placeholder="email anggota (sudah terdaftar)"
            className="h-10 max-w-xs flex-1 rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
          />
          <select value={role} onChange={(e) => setRole(e.target.value as "ADMIN" | "AGENT")} className="h-10 rounded-xl border border-border bg-card px-2 text-sm text-foreground">
            <option value="AGENT">Agent</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button type="submit" className="flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">
            Tambah anggota
          </button>
          {error && <span className="w-full text-sm text-destructive">{error}</span>}
          {info && <p className="w-full rounded-xl bg-success/10 px-3 py-2 text-sm text-success">{info}</p>}
        </form>
      )}

      {/* cg-card cg-sheet seperti form di atas dan panel aktivitas di bawah — dengan
          garis tipis saja tabel ini terbaca belum jadi di antara keduanya. */}
      {/* overflow-x-auto, bukan cuma overflow-hidden: di layar ponsel tabel ini
          9px lebih lebar dari layar dan kolom "Peran" terpotong tanpa ada cara
          menggesernya. */}
      <div className="cg-card cg-sheet overflow-x-auto rounded-xl">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted text-left">
              <th className="p-3 text-xs font-semibold uppercase text-muted-foreground">Nama</th>
              <th className="p-3 text-xs font-semibold uppercase text-muted-foreground">Email</th>
              <th className="p-3 text-xs font-semibold uppercase text-muted-foreground">Peran</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-border/50 last:border-0 transition-colors duration-150 hover:bg-card">
                <td className="p-3 font-medium text-foreground">{m.name}{m.isSelf && <span className="ml-1 text-xs text-muted-foreground">(Anda)</span>}</td>
                <td className="p-3 text-muted-foreground">{m.email}</td>
                <td className="p-3">
                  {isManager && m.role !== "OWNER" ? (
                    <select value={m.role} onChange={(e) => changeRole(m.id, e.target.value)} className={SELECT_CLASS}>
                      <option value="ADMIN">Admin</option>
                      <option value="AGENT">Agent</option>
                    </select>
                  ) : (
                    <span className="text-foreground/80">{ROLE_LABEL[m.role] ?? m.role}</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  {isManager && m.role !== "OWNER" && (
                    <button onClick={() => remove(m.id)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-destructive/30 hover:text-destructive">
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
        <h2 className="mb-2 text-lg font-semibold text-foreground">Aktivitas terbaru</h2>
        <div className="cg-card cg-sheet space-y-1 rounded-xl p-4 text-sm">
          {logs.length === 0 && <p className="text-muted-foreground">Belum ada aktivitas tercatat.</p>}
          {logs.map((l) => (
            <div key={l.id} className="flex justify-between border-b border-border/50 py-1.5 last:border-0">
              <span className="text-foreground/80">
                <span className="font-bold text-foreground">{l.actor}</span> · {l.action}{l.target ? ` · ${l.target}` : ""}
              </span>
              <span className="text-muted-foreground">{new Date(l.createdAt).toLocaleString("id-ID")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

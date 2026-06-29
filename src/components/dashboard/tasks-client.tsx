"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate: string;
  status: "PENDING" | "COMPLETED" | "OVERDUE";
  contactName: string;
}
interface ContactLite { id: string; name: string | null; phone: string }

const PRIORITY_LABEL = { HIGH: "Tinggi", MEDIUM: "Sedang", LOW: "Rendah" };
const PRIORITY_COLOR = { HIGH: "bg-red-500/15 text-red-400", MEDIUM: "bg-amber-500/15 text-amber-400", LOW: "bg-muted text-muted-foreground" };
const STATUS_LABEL = { PENDING: "Belum", COMPLETED: "Selesai", OVERDUE: "Terlambat" };

const SELECT_CLASS = "h-10 rounded-xl border border-border bg-card px-2 text-sm text-foreground focus:outline-none [&>option]:bg-card [&>option]:text-foreground";

export default function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<ContactLite[]>([]);
  const [filter, setFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [contactId, setContactId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    const r = await fetch(`/api/tasks?status=${filter}`);
    const j = await r.json();
    if (j.success) setTasks(j.data);
  }
  async function loadContacts() {
    const r = await fetch("/api/contacts?pageSize=100");
    const j = await r.json();
    if (j.success) setContacts(j.data.items);
  }
  useEffect(() => { loadContacts(); }, []);
  useEffect(() => { loadTasks(); }, [filter]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!dueDate || !contactId) { setError("Kontak dan tanggal wajib diisi."); return; }
    const r = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, contactId, dueDate: new Date(dueDate).toISOString(), priority }),
    });
    const j = await r.json();
    if (!r.ok) { setError(j?.error?.message ?? "Gagal membuat task"); return; }
    setTitle("");
    setDueDate("");
    loadTasks();
  }

  async function toggle(t: Task) {
    await fetch(`/api/tasks/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: t.status !== "COMPLETED" }),
    });
    loadTasks();
  }
  async function remove(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    loadTasks();
  }

  const FILTERS = [
    { key: "all", label: "Semua" },
    { key: "pending", label: "Belum" },
    { key: "overdue", label: "Terlambat" },
    { key: "completed", label: "Selesai" },
  ];

  return (
    <div className="space-y-5">
      <div className="cg-card rounded-2xl p-4">
        <form onSubmit={create} className="grid gap-3 lg:grid-cols-[1fr_220px_160px_140px_auto]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul tugas"
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <select value={contactId} onChange={(e) => setContactId(e.target.value)} className={SELECT_CLASS}>
            <option value="">Kontak...</option>
            {contacts.map((c) => (<option key={c.id} value={c.id}>{c.name ?? `+${c.phone}`}</option>))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none"
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={SELECT_CLASS}>
            <option value="HIGH">Tinggi</option>
            <option value="MEDIUM">Sedang</option>
            <option value="LOW">Rendah</option>
          </select>
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex h-10 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-4 text-sm font-bold text-primary transition hover:bg-primary/25 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </button>
        </form>
      </div>
      {error && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "h-8 rounded-full px-3 text-xs font-bold transition",
              filter === f.key
                ? "bg-primary/20 text-primary"
                : "border border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-10 p-3"></th>
                <th className="p-3 text-left text-xs font-bold uppercase text-muted-foreground">Tugas</th>
                <th className="p-3 text-left text-xs font-bold uppercase text-muted-foreground">Kontak</th>
                <th className="p-3 text-left text-xs font-bold uppercase text-muted-foreground">Jatuh tempo</th>
                <th className="p-3 text-left text-xs font-bold uppercase text-muted-foreground">Prioritas</th>
                <th className="p-3 text-left text-xs font-bold uppercase text-muted-foreground">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={t.status === "COMPLETED"}
                      onChange={() => toggle(t)}
                      aria-label="Tandai selesai"
                      className="h-4 w-4 cursor-pointer accent-primary"
                    />
                  </td>
                  <td className={cn("p-3 font-bold", t.status === "COMPLETED" ? "text-muted-foreground line-through" : "text-foreground")}>{t.title}</td>
                  <td className="p-3 text-muted-foreground">{t.contactName}</td>
                  <td className="p-3 text-muted-foreground">{new Date(t.dueDate).toLocaleDateString("id-ID")}</td>
                  <td className="p-3">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", PRIORITY_COLOR[t.priority])}>
                      {PRIORITY_LABEL[t.priority]}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold",
                      t.status === "OVERDUE" ? "bg-red-500/15 text-red-400"
                        : t.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-muted text-muted-foreground"
                    )}>
                      {STATUS_LABEL[t.status]}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => remove(t.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">Belum ada tugas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

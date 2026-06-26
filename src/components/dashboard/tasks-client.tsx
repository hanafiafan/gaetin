"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
const STATUS_LABEL = { PENDING: "Belum", COMPLETED: "Selesai", OVERDUE: "Terlambat" };

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
  useEffect(() => {
    loadContacts();
  }, []);
  useEffect(() => {
    loadTasks();
  }, [filter]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!dueDate || !contactId) {
      setError("Kontak dan tanggal wajib diisi.");
      return;
    }
    const r = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        contactId,
        dueDate: new Date(dueDate).toISOString(),
        priority,
      }),
    });
    const j = await r.json();
    if (!r.ok) {
      setError(j?.error?.message ?? "Gagal membuat task");
      return;
    }
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

  return (
    <div className="space-y-5">
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-4">
      <form onSubmit={create} className="grid gap-3 lg:grid-cols-[1fr_220px_160px_140px_auto]">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul tugas" />
        <select value={contactId} onChange={(e) => setContactId(e.target.value)} className="h-10 rounded-md border border-input bg-background px-2 text-sm">
          <option value="">Kontak...</option>
          {contacts.map((c) => (<option key={c.id} value={c.id}>{c.name ?? `+${c.phone}`}</option>))}
        </select>
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="h-10 rounded-md border border-input bg-background px-2 text-sm">
          <option value="HIGH">Tinggi</option>
          <option value="MEDIUM">Sedang</option>
          <option value="LOW">Rendah</option>
        </select>
        <Button type="submit" disabled={!title.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah
        </Button>
      </form>
        </CardContent>
      </Card>
      {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      <div className="flex flex-wrap gap-2">
        {["all", "pending", "overdue", "completed"].map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
            {f === "all" ? "Semua" : f === "pending" ? "Belum" : f === "overdue" ? "Terlambat" : "Selesai"}
          </Button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-muted/40">
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="w-10 p-3"></th>
              <th className="p-3">Tugas</th>
              <th className="p-3">Kontak</th>
              <th className="p-3">Jatuh tempo</th>
              <th className="p-3">Prioritas</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="p-3">
                  <input type="checkbox" checked={t.status === "COMPLETED"} onChange={() => toggle(t)} aria-label="Tandai selesai" />
                </td>
                <td className={cn("p-3 font-medium", t.status === "COMPLETED" && "text-muted-foreground line-through")}>{t.title}</td>
                <td className="p-3 text-muted-foreground">{t.contactName}</td>
                <td className="p-3 text-muted-foreground">{new Date(t.dueDate).toLocaleDateString("id-ID")}</td>
                <td className="p-3"><Badge variant="outline">{PRIORITY_LABEL[t.priority]}</Badge></td>
                <td className="p-3">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs", t.status === "OVERDUE" ? "bg-red-500/10 text-red-600" : t.status === "COMPLETED" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground")}>
                    {STATUS_LABEL[t.status]}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => remove(t.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Belum ada tugas.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

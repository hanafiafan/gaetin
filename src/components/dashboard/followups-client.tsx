"use client";

import { useEffect, useState } from "react";
import { Gauge, Loader2, Play, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Account { id: string; label: string; status: string }
interface Rule {
  id: string;
  name: string;
  triggerValue: { days?: number } | null;
  isActive: boolean;
  scheduleCount: number;
}
interface MessagingQuota {
  planName: string;
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
}

export default function FollowUpsClient() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [quota, setQuota] = useState<MessagingQuota | null>(null);
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [days, setDays] = useState(3);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  async function load() {
    const [ra, rr, rq] = await Promise.all([
      fetch("/api/whatsapp/accounts"),
      fetch("/api/follow-ups"),
      fetch("/api/messaging/quota"),
    ]);
    const [ja, jr, jq] = await Promise.all([ra.json(), rr.json(), rq.json()]);
    if (ja.success) {
      setAccounts(ja.data);
      const c = ja.data.find((a: Account) => a.status === "connected");
      if (c) setAccountId(c.id);
    }
    if (jr.success) setRules(jr.data);
    if (jq.success) setQuota(jq.data);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/follow-ups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, accountId, days, messageTemplate: message }),
    });
    const j = await r.json();
    if (!r.ok) {
      setError(j?.error?.message ?? "Gagal membuat aturan");
      return;
    }
    setName("");
    setMessage("");
    load();
  }

  async function toggle(rule: Rule) {
    await fetch(`/api/follow-ups/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !rule.isActive }),
    });
    load();
  }
  async function remove(id: string) {
    if (!confirm("Hapus aturan ini?")) return;
    await fetch(`/api/follow-ups/${id}`, { method: "DELETE" });
    load();
  }
  async function runNow() {
    setRunning(true);
    const r = await fetch("/api/follow-ups/run", { method: "POST" });
    const j = await r.json();
    setRunning(false);
    if (j.success) {
      alert(`Dibuat ${j.data.generated} jadwal, terkirim ${j.data.sent}, gagal ${j.data.failed}.`);
      load();
    } else {
      setError(j?.error?.message ?? "Gagal menjalankan follow-up");
    }
  }

  const connected = accounts.filter((a) => a.status === "connected");

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="space-y-4 p-5">
      <form onSubmit={create} className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Aturan follow-up baru</h2>
          <p className="mt-1 text-sm text-muted-foreground">Kirim pesan otomatis setelah beberapa hari tanpa balasan.</p>
        </div>
        {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
        {quota && (
          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Gauge className="h-4 w-4 text-primary" />
                Kuota kirim harian
              </div>
              <span className="text-xs text-muted-foreground">{quota.planName}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, Math.round((quota.used / quota.limit) * 100))}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {quota.remaining.toLocaleString("id-ID")} sisa dari {quota.limit.toLocaleString("id-ID")} pesan hari ini.
            </p>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama aturan" />
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Pilih nomor WhatsApp...</option>
            {connected.map((a) => (<option key={a.id} value={a.id}>{a.label}</option>))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Kirim jika tidak ada balasan selama</span>
          <Input type="number" min={1} max={90} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-20" />
          <span className="text-sm text-muted-foreground">hari</span>
        </div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Pesan follow-up... Halo {{nama}}, masih berminat?" className="w-full rounded-md border border-input bg-background p-3 text-sm" />
        <Button type="submit" className="w-full rounded-full" disabled={!accountId || !name.trim() || !message.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          Simpan aturan
        </Button>
        {connected.length === 0 && <p className="text-xs text-destructive">Hubungkan nomor WhatsApp dulu di Pengaturan.</p>}
      </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Aturan aktif</h2>
          <p className="text-sm text-muted-foreground">{rules.length} aturan tersimpan</p>
        </div>
        <Button variant="outline" size="sm" onClick={runNow} disabled={running || quota?.remaining === 0}>
          {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          {running ? "Memproses..." : "Jalankan"}
        </Button>
      </div>

      <div className="space-y-2">
        {rules.length === 0 && <p className="text-sm text-muted-foreground">Belum ada aturan follow-up.</p>}
        {rules.map((r) => (
          <div key={r.id} className="flex flex-col gap-3 rounded-2xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 font-medium">
                {r.name}
                <Badge variant={r.isActive ? "default" : "outline"}>{r.isActive ? "Aktif" : "Nonaktif"}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {r.triggerValue?.days ?? "?"} hari tanpa balasan · {r.scheduleCount} jadwal
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toggle(r)}>
                {r.isActive ? "Nonaktifkan" : "Aktifkan"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Catatan: di produksi, "Jalankan sekarang" dijalankan otomatis berkala oleh cron (Fase 7).
      </p>
        </CardContent>
      </Card>
    </div>
  );
}

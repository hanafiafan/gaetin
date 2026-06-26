"use client";

import { useEffect, useState } from "react";
import { Gauge, Loader2, Play, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
      fetch("/api/whatsapp/accounts"), fetch("/api/follow-ups"), fetch("/api/messaging/quota"),
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
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/follow-ups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, accountId, days, messageTemplate: message }),
    });
    const j = await r.json();
    if (!r.ok) { setError(j?.error?.message ?? "Gagal membuat aturan"); return; }
    setName(""); setMessage("");
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
  const SELECT_CLASS = "h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white focus:outline-none";

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="cg-card rounded-2xl p-5 space-y-4">
        <form onSubmit={create} className="space-y-3">
          <div>
            <h2 className="font-black text-white">Aturan follow-up baru</h2>
            <p className="mt-1 text-sm text-slate-400">Kirim pesan otomatis setelah beberapa hari tanpa balasan.</p>
          </div>
          {error && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
          {quota && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Gauge className="h-4 w-4 text-primary" />
                  Kuota kirim harian
                </div>
                <span className="text-xs text-slate-400">{quota.planName}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/[0.08]">
                <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, Math.round((quota.used / quota.limit) * 100))}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {quota.remaining.toLocaleString("id-ID")} sisa dari {quota.limit.toLocaleString("id-ID")} pesan hari ini.
              </p>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama aturan"
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={SELECT_CLASS}>
              <option value="">Pilih nomor WhatsApp...</option>
              {connected.map((a) => (<option key={a.id} value={a.id}>{a.label}</option>))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Kirim jika tidak ada balasan selama</span>
            <input
              type="number"
              min={1}
              max={90}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="h-10 w-20 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white focus:outline-none"
            />
            <span className="text-sm text-slate-400">hari</span>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Pesan follow-up... Halo {{nama}}, masih berminat?"
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!accountId || !name.trim() || !message.trim()}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/15 text-sm font-bold text-primary transition hover:bg-primary/25 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Simpan aturan
          </button>
          {connected.length === 0 && <p className="text-xs text-destructive">Hubungkan nomor WhatsApp dulu di Pengaturan.</p>}
        </form>
      </div>

      <div className="cg-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-black text-white">Aturan aktif</h2>
            <p className="text-sm text-slate-400">{rules.length} aturan tersimpan</p>
          </div>
          <button
            onClick={runNow}
            disabled={running || quota?.remaining === 0}
            className="flex h-9 items-center gap-1.5 rounded-full border border-white/[0.08] px-4 text-sm font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary disabled:opacity-50"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Memproses..." : "Jalankan"}
          </button>
        </div>

        <div className="space-y-2">
          {rules.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center text-sm text-slate-500">
              Belum ada aturan follow-up.
            </div>
          ) : rules.map((r) => (
            <div key={r.id} className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-white">
                  {r.name}
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", r.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-400")}>
                    {r.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {r.triggerValue?.days ?? "?"} hari tanpa balasan · {r.scheduleCount} jadwal
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggle(r)}
                  className="h-8 rounded-full border border-white/[0.08] px-3 text-xs font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary"
                >
                  {r.isActive ? "Nonaktifkan" : "Aktifkan"}
                </button>
                <button
                  onClick={() => remove(r.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Di produksi, &ldquo;Jalankan&rdquo; dieksekusi otomatis secara berkala oleh cron.
        </p>
      </div>
    </div>
  );
}

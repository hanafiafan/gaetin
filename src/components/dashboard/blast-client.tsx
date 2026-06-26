"use client";

import { useEffect, useRef, useState } from "react";
import { Gauge, Loader2, Play, Send, StopCircle, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Account { id: string; label: string; status: string }
interface Blast {
  id: string;
  name: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
}
interface MessagingQuota {
  planName: string;
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
}

function blastPct(blast: Blast) {
  if (blast.totalRecipients <= 0) return 0;
  return Math.round(((blast.sentCount + blast.failedCount) / blast.totalRecipients) * 100);
}

const STATUS_COLOR: Record<string, string> = {
  RUNNING: "bg-primary/15 text-primary",
  DONE: "bg-emerald-500/15 text-emerald-400",
  FAILED: "bg-red-500/15 text-red-400",
  STOPPED: "bg-red-500/15 text-red-400",
  DRAFT: "bg-slate-500/15 text-slate-400",
};

const SELECT_CLASS = "h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white focus:outline-none";

export default function BlastClient() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [quota, setQuota] = useState<MessagingQuota | null>(null);
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [scope, setScope] = useState<"activeWa" | "all">("activeWa");
  const [label, setLabel] = useState("");
  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadAccounts() {
    const res = await fetch("/api/whatsapp/accounts");
    const json = await res.json();
    if (json.success) {
      setAccounts(json.data);
      const connected = json.data.find((a: Account) => a.status === "connected");
      if (connected) setAccountId(connected.id);
    }
  }

  async function loadBlasts() {
    const res = await fetch("/api/blast");
    const json = await res.json();
    if (json.success) setBlasts(json.data);
    const quotaRes = await fetch("/api/messaging/quota");
    const quotaJson = await quotaRes.json();
    if (quotaJson.success) setQuota(quotaJson.data);
  }

  useEffect(() => {
    loadAccounts();
    loadBlasts();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    const anyRunning = blasts.some((b) => b.status === "RUNNING");
    if (anyRunning && !pollRef.current) pollRef.current = setInterval(loadBlasts, 2500);
    else if (!anyRunning && pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, [blasts]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    const res = await fetch("/api/blast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, accountId, messageText, scope, label: label || undefined }),
    });
    const json = await res.json();
    setCreating(false);
    if (!res.ok) { setError(json?.error?.message ?? "Gagal membuat blast"); return; }
    setName(""); setMessageText(""); setLabel("");
    loadBlasts();
  }

  async function execute(id: string) {
    setError(null);
    const res = await fetch(`/api/blast/${id}/execute`, { method: "POST" });
    if (!res.ok) { const j = await res.json(); setError(j?.error?.message ?? "Gagal menjalankan blast"); }
    loadBlasts();
  }

  async function stop(id: string) {
    await fetch(`/api/blast/${id}/stop`, { method: "POST" });
    loadBlasts();
  }

  const connected = accounts.filter((a) => a.status === "connected");

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="cg-card rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="font-black text-white">Buat blast baru</h2>
          <p className="mt-1 text-sm text-slate-400">Pilih nomor pengirim, target penerima, lalu tulis pesan personal.</p>
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
        <form onSubmit={create} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama blast"
            className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none"
          />
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={SELECT_CLASS}>
            <option value="">Pilih nomor WhatsApp...</option>
            {connected.map((a) => (<option key={a.id} value={a.id}>{a.label}</option>))}
          </select>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <select value={scope} onChange={(e) => setScope(e.target.value as "activeWa" | "all")} className={SELECT_CLASS}>
              <option value="activeWa">Hanya aktif WA</option>
              <option value="all">Semua kontak</option>
            </select>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Filter label (opsional)"
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none"
            />
          </div>
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Halo {{nama}}, kami punya penawaran khusus untuk area {{kota}}..."
            rows={7}
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none"
          />
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-xs leading-5 text-slate-400">
            <Wand2 className="mr-1 inline h-3.5 w-3.5 text-primary" />
            Personalisasi: {"{{nama}}"}, {"{{kota}}"}. Spintax: {"{pagi|siang|sore}"}.
          </div>
          <button
            type="submit"
            disabled={creating || !accountId || !name.trim() || !messageText.trim()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/15 text-sm font-bold text-primary transition hover:bg-primary/25 disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {creating ? "Membuat..." : "Buat blast"}
          </button>
          {connected.length === 0 && (
            <p className="text-xs text-destructive">Hubungkan nomor WhatsApp dulu di Pengaturan.</p>
          )}
        </form>
      </div>

      <div className="cg-card rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="font-black text-white">Riwayat blast</h2>
          <p className="text-sm text-slate-400">{blasts.length} blast dibuat</p>
        </div>
        <div className="space-y-3">
          {blasts.map((blast) => {
            const pct = blastPct(blast);
            const sc = STATUS_COLOR[blast.status] ?? "bg-slate-500/15 text-slate-400";
            return (
              <div key={blast.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-bold text-white">{blast.name}</h3>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-bold", sc)}>{blast.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {blast.totalRecipients} penerima · {blast.sentCount} terkirim · {blast.failedCount} gagal
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {blast.status === "DRAFT" && (
                      <button
                        onClick={() => execute(blast.id)}
                        disabled={quota?.remaining === 0}
                        className="flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-3 text-xs font-bold text-primary transition hover:bg-primary/25 disabled:opacity-50"
                      >
                        <Play className="h-3 w-3" /> Kirim
                      </button>
                    )}
                    {blast.status === "RUNNING" && (
                      <button
                        onClick={() => stop(blast.id)}
                        className="flex h-8 items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/15 px-3 text-xs font-bold text-red-400 transition hover:bg-red-500/25"
                      >
                        <StopCircle className="h-3 w-3" /> Hentikan
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Progress</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06]">
                    <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
          {blasts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/[0.08] p-10 text-center text-sm text-slate-500">
              Belum ada blast. Buat pesan pertama dari panel di kiri.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Gauge, Loader2, Play, Send, StopCircle, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Account {
  id: string;
  label: string;
  status: string;
}
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

function progress(blast: Blast) {
  if (blast.totalRecipients <= 0) return 0;
  return Math.round(((blast.sentCount + blast.failedCount) / blast.totalRecipients) * 100);
}

function statusVariant(status: string) {
  if (status === "RUNNING") return "default";
  if (status === "FAILED" || status === "STOPPED") return "destructive";
  return "outline";
}

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
      const connected = json.data.find((account: Account) => account.status === "connected");
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
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    const anyRunning = blasts.some((blast) => blast.status === "RUNNING");
    if (anyRunning && !pollRef.current) {
      pollRef.current = setInterval(loadBlasts, 2500);
    } else if (!anyRunning && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
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
    if (!res.ok) {
      setError(json?.error?.message ?? "Gagal membuat blast");
      return;
    }
    setName("");
    setMessageText("");
    setLabel("");
    loadBlasts();
  }

  async function execute(id: string) {
    setError(null);
    const res = await fetch(`/api/blast/${id}/execute`, { method: "POST" });
    if (!res.ok) {
      const json = await res.json();
      setError(json?.error?.message ?? "Gagal menjalankan blast");
    }
    loadBlasts();
  }

  async function stop(id: string) {
    await fetch(`/api/blast/${id}/stop`, { method: "POST" });
    loadBlasts();
  }

  const connected = accounts.filter((account) => account.status === "connected");

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div>
            <h2 className="text-lg font-semibold">Buat blast baru</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pilih nomor pengirim, target penerima, lalu tulis pesan personal.</p>
          </div>
          {error && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
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
          <form onSubmit={create} className="space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama blast" className="h-11" />
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Pilih nomor WhatsApp...</option>
              {connected.map((account) => (
                <option key={account.id} value={account.id}>{account.label}</option>
              ))}
            </select>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as "activeWa" | "all")}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="activeWa">Hanya aktif WA</option>
                <option value="all">Semua kontak</option>
              </select>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Filter label (opsional)" className="h-11" />
            </div>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Halo {{nama}}, kami punya penawaran khusus untuk area {{kota}}..."
              rows={7}
              className="w-full rounded-xl border border-input bg-background p-3 text-sm"
            />
            <div className="rounded-xl border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
              <Wand2 className="mr-1 inline h-3.5 w-3.5" />
              Personalisasi: {"{{nama}}"}, {"{{kota}}"}. Spintax: {"{pagi|siang|sore}"}.
            </div>
            <Button type="submit" className="h-11 w-full rounded-full" disabled={creating || !accountId || !name.trim() || !messageText.trim()}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {creating ? "Membuat..." : "Buat blast"}
            </Button>
            {connected.length === 0 && (
              <p className="text-xs text-destructive">Hubungkan nomor WhatsApp dulu di Pengaturan.</p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Riwayat blast</h2>
              <p className="text-sm text-muted-foreground">{blasts.length} blast dibuat</p>
            </div>
          </div>
          <div className="space-y-3">
            {blasts.map((blast) => {
              const pct = progress(blast);
              return (
                <div key={blast.id} className="rounded-2xl border bg-background p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold">{blast.name}</h3>
                        <Badge variant={statusVariant(blast.status)}>{blast.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {blast.totalRecipients} penerima · {blast.sentCount} terkirim · {blast.failedCount} gagal
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {blast.status === "DRAFT" && (
                        <Button size="sm" onClick={() => execute(blast.id)} disabled={quota?.remaining === 0}>
                          <Play className="mr-2 h-4 w-4" />
                          Kirim
                        </Button>
                      )}
                      {blast.status === "RUNNING" && (
                        <Button size="sm" variant="destructive" onClick={() => stop(blast.id)}>
                          <StopCircle className="mr-2 h-4 w-4" />
                          Hentikan
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {blasts.length === 0 && (
              <div className="rounded-2xl border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
                Belum ada blast. Buat pesan pertama dari panel di kiri.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mail, Play, StopCircle, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailBlast {
  id: string;
  name: string;
  subject: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
}

function blastPct(blast: EmailBlast) {
  if (blast.totalRecipients <= 0) return 0;
  return Math.round(((blast.sentCount + blast.failedCount) / blast.totalRecipients) * 100);
}

const STATUS_COLOR: Record<string, string> = {
  RUNNING: "bg-primary/15 text-foreground",
  COMPLETED: "bg-success/15 text-success",
  FAILED: "bg-destructive/15 text-destructive",
  STOPPED: "bg-destructive/15 text-destructive",
  DRAFT: "bg-muted-foreground/15 text-muted-foreground",
};

export default function EmailBlastClient() {
  const [blasts, setBlasts] = useState<EmailBlast[]>([]);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [label, setLabel] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadBlasts() {
    const res = await fetch("/api/email-blast");
    const json = await res.json();
    if (json.success) setBlasts(json.data);
  }

  useEffect(() => {
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
    const res = await fetch("/api/email-blast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, subject, bodyText, label: label || undefined }),
    });
    const json = await res.json();
    setCreating(false);
    if (!res.ok) { setError(json?.error?.message ?? "Gagal membuat email blast"); return; }
    setName(""); setSubject(""); setBodyText(""); setLabel("");
    loadBlasts();
  }

  async function execute(id: string) {
    setError(null);
    const res = await fetch(`/api/email-blast/${id}/execute`, { method: "POST" });
    if (!res.ok) { const j = await res.json(); setError(j?.error?.message ?? "Gagal menjalankan email blast"); }
    loadBlasts();
  }

  async function stop(id: string) {
    await fetch(`/api/email-blast/${id}/stop`, { method: "POST" });
    loadBlasts();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="cg-card rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="font-black text-foreground">Buat email blast baru</h2>
          <p className="mt-1 text-sm text-muted-foreground">Target otomatis ke kontak yang punya email. Tulis subjek dan isi pesan personal.</p>
        </div>
        {error && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
        <form onSubmit={create} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama email blast"
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
          />
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subjek email, mis. Penawaran khusus untuk {{kota}}"
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
          />
          <div>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Filter label / tag (opsional, contoh: vip)"
              className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              *Biarkan <strong>kosong</strong> untuk mengirim ke semua kontak yang punya email.
            </p>
          </div>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="Halo {{nama}}, kami punya penawaran khusus untuk area {{kota}}..."
            rows={7}
            className="w-full resize-none rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
          />
          <div className="rounded-xl border border-border bg-card p-3 text-xs leading-5 text-muted-foreground">
            <Wand2 className="mr-1 inline h-3.5 w-3.5 text-foreground" />
            Personalisasi: {"{{nama}}"}, {"{{kota}}"}. Spintax: {"{pagi|siang|sore}"}.
          </div>
          <button
            type="submit"
            disabled={creating || !name.trim() || !subject.trim() || !bodyText.trim()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/15 text-sm font-bold text-foreground transition hover:bg-primary/25 disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {creating ? "Membuat..." : "Buat email blast"}
          </button>
        </form>
      </div>

      <div className="cg-card rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="font-black text-foreground">Riwayat email blast</h2>
          <p className="text-sm text-muted-foreground">{blasts.length} email blast dibuat</p>
        </div>
        <div className="space-y-3">
          {blasts.map((blast) => {
            const pct = blastPct(blast);
            const sc = STATUS_COLOR[blast.status] ?? "bg-muted-foreground/15 text-muted-foreground";
            return (
              <div key={blast.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-bold text-foreground">{blast.name}</h3>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-bold", sc)}>{blast.status}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{blast.subject}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {blast.totalRecipients} penerima · {blast.sentCount} terkirim · {blast.failedCount} gagal
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {blast.status === "DRAFT" && (
                      <button
                        onClick={() => execute(blast.id)}
                        className="flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-3 text-xs font-bold text-foreground transition hover:bg-primary/25"
                      >
                        <Play className="h-3 w-3" /> Kirim
                      </button>
                    )}
                    {blast.status === "RUNNING" && (
                      <button
                        onClick={() => stop(blast.id)}
                        className="flex h-8 items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/15 px-3 text-xs font-bold text-destructive transition hover:bg-destructive/25"
                      >
                        <StopCircle className="h-3 w-3" /> Hentikan
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
          {blasts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Belum ada email blast. Buat pesan pertama dari panel di kiri.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

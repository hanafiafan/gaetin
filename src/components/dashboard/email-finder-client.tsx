"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Mail, Play, Send, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Source = "LEAD" | "CONTACT";

interface FindJob {
  id: string;
  source: Source;
  label: string | null;
  status: string;
  totalTargets: number;
  processed: number;
  found: number;
  createdAt: string;
}

function jobPct(job: FindJob) {
  if (job.totalTargets <= 0) return 0;
  return Math.round((job.processed / job.totalTargets) * 100);
}

const STATUS_COLOR: Record<string, string> = {
  RUNNING: "bg-primary/15 text-foreground",
  COMPLETED: "bg-success/15 text-success",
  FAILED: "bg-destructive/15 text-destructive",
  STOPPED: "bg-destructive/15 text-destructive",
  DRAFT: "bg-muted-foreground/15 text-muted-foreground",
};

const SOURCE_LABEL: Record<Source, string> = { LEAD: "Lead (hasil scraping)", CONTACT: "Kontak tersimpan" };

export default function EmailFinderClient() {
  const [jobs, setJobs] = useState<FindJob[]>([]);
  const [source, setSource] = useState<Source>("LEAD");
  const [label, setLabel] = useState("");
  const [candidateCount, setCandidateCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadJobs() {
    const res = await fetch("/api/email-finder");
    const json = await res.json();
    if (json.success) setJobs(json.data);
  }

  async function loadCandidateCount() {
    const params = new URLSearchParams({ source });
    if (label) params.set("label", label);
    const res = await fetch(`/api/email-finder/candidates?${params.toString()}`);
    const json = await res.json();
    if (json.success) setCandidateCount(json.data.count);
  }

  useEffect(() => {
    loadJobs();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    const t = setTimeout(loadCandidateCount, 250);
    return () => clearTimeout(t);
  }, [source, label]);

  useEffect(() => {
    const anyRunning = jobs.some((j) => j.status === "RUNNING");
    if (anyRunning && !pollRef.current) pollRef.current = setInterval(loadJobs, 2500);
    else if (!anyRunning && pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, [jobs]);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    const res = await fetch("/api/email-finder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, label: label || undefined }),
    });
    const json = await res.json();
    setCreating(false);
    if (!res.ok) { setError(json?.error?.message ?? "Gagal memulai pencarian"); return; }
    loadJobs();
    loadCandidateCount();
  }

  async function stop(id: string) {
    await fetch(`/api/email-finder/${id}/stop`, { method: "POST" });
    loadJobs();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className="cg-card rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="font-black text-foreground">Mulai pencarian baru</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pilih sumber data, lalu jalankan — proses berjalan di latar belakang.</p>
        </div>
        {error && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
        <form onSubmit={start} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(["LEAD", "CONTACT"] as Source[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSource(s)}
                className={cn(
                  "h-11 rounded-xl border px-3 text-xs font-bold transition",
                  source === s ? "border-primary/40 bg-primary/15 text-foreground" : "border-border text-foreground/70 hover:border-primary/30",
                )}
              >
                {SOURCE_LABEL[s]}
              </button>
            ))}
          </div>
          <div>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={source === "LEAD" ? "Filter kategori (opsional)" : "Filter label (opsional)"}
              className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">*Biarkan kosong untuk semua data yang punya website tapi belum ada email.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-2xl font-black text-foreground">{candidateCount ?? "…"}</p>
            <p className="text-xs text-muted-foreground">{SOURCE_LABEL[source]} siap dicari (maks 500/proses)</p>
          </div>
          <button
            type="submit"
            disabled={creating || !candidateCount}
            className="flex h-11 w-full items-center justify-center gap-2 bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {creating ? "Memulai..." : "Mulai Cari Email"}
          </button>
          {source === "LEAD" && (
            <p className="text-[11px] text-muted-foreground">
              Catatan: email yang ditemukan di sini ikut tersalin otomatis begitu lead disimpan jadi Kontak di halaman Scraper.
            </p>
          )}
        </form>
      </div>

      <div className="cg-card rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="font-black text-foreground">Riwayat pencarian</h2>
          <p className="text-sm text-muted-foreground">{jobs.length} proses dijalankan</p>
        </div>
        <div className="space-y-3">
          {jobs.map((job) => {
            const pct = jobPct(job);
            const sc = STATUS_COLOR[job.status] ?? "bg-muted-foreground/15 text-muted-foreground";
            return (
              <div key={job.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-bold text-foreground">{SOURCE_LABEL[job.source]}</h3>
                      <span className={cn("shrink-0 px-2 py-0.5 text-xs font-bold", sc)}>{job.status}</span>
                    </div>
                    {job.label && <p className="mt-0.5 text-xs text-muted-foreground">Filter: {job.label}</p>}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {job.totalTargets} target · {job.processed} diproses · {job.found} email ditemukan
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {job.status === "RUNNING" && (
                      <button
                        onClick={() => stop(job.id)}
                        className="flex h-8 items-center gap-1.5 border border-destructive/30 bg-destructive/15 px-3 text-xs font-bold text-destructive transition hover:bg-destructive/25"
                      >
                        <StopCircle className="h-3 w-3" /> Hentikan
                      </button>
                    )}
                    {job.status === "COMPLETED" && job.found > 0 && (
                      <Link
                        href="/dashboard/email-blast"
                        className="flex h-8 items-center gap-1.5 bg-primary px-3 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
                      >
                        <Send className="h-3 w-3" /> Kirim Email Blast
                      </Link>
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
          {jobs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              <Play className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
              Belum ada pencarian. Mulai dari panel kiri.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

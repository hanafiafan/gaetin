"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  MessageSquare,
  StickyNote,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Satu kontak, seluruh riwayatnya, dalam satu panel.
 *
 * Sebelumnya tidak ada satu pun halaman yang menjawab "ada apa saja dengan
 * orang ini?" — pesannya di Pesan Masuk, tugasnya di Daftar Tugas, penjualannya
 * di Peluang Penjualan, dan hasil teleponnya tidak ke mana-mana karena memang
 * belum ada tempatnya. Panel ini dibuka dari Daftar Kontak dan dari Pesan
 * Masuk, jadi riwayatnya selalu satu klik dari tempat orang bekerja.
 */

type TimelineKind = "INBOUND" | "OUTBOUND" | "NOTE" | "TASK" | "DEAL";

interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  at: string;
  title: string;
  body?: string | null;
  meta?: string | null;
}

interface ContactDetail {
  contact: {
    id: string;
    name: string | null;
    phone: string;
    email: string | null;
    city: string | null;
    category: string | null;
    label: string | null;
    website: string | null;
    waStatus: string;
    score: number;
    source: string;
    createdAt: string;
    lastInboundAt: string | null;
    lastOutboundAt: string | null;
  };
  stage: string | null;
  optedOut: boolean;
  summary: { inbound: number; outbound: number; openTasks: number; wonValue: number };
  entries: TimelineEntry[];
}

const KIND_STYLE: Record<TimelineKind, { label: string; icon: typeof StickyNote; className: string }> = {
  INBOUND: { label: "Masuk", icon: ArrowDownLeft, className: "bg-success/10 text-success" },
  OUTBOUND: { label: "Keluar", icon: ArrowUpRight, className: "bg-foreground/[0.07] text-foreground/70" },
  NOTE: { label: "Catatan", icon: StickyNote, className: "bg-warning/15 text-warning" },
  TASK: { label: "Tugas", icon: CheckCircle2, className: "bg-kelola/10 text-kelola" },
  DEAL: { label: "Penjualan", icon: Trophy, className: "bg-primary/20 text-foreground" },
};

function waktu(iso: string) {
  return new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function ContactPanel({ contactId, onClose }: { contactId: string | null; onClose: () => void }) {
  const [data, setData] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");

  async function load(id: string) {
    setLoading(true);
    const r = await fetch(`/api/contacts/${id}/timeline`);
    const j = await r.json();
    setData(j.success ? j.data : null);
    setLoading(false);
  }

  useEffect(() => {
    if (!contactId) {
      setData(null);
      return;
    }
    load(contactId);
    setNote("");
    setTaskOpen(false);
    setTaskTitle("");
    setTaskDate("");
  }, [contactId]);

  // Panel yang menutupi halaman harus bisa ditutup dengan Escape; tanpa itu ia
  // menjebak orang yang membukanya dari keyboard.
  useEffect(() => {
    if (!contactId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [contactId, onClose]);

  if (!contactId) return null;

  // Dirender ke <body> lewat portal. Lembar terang dashboard punya
  // rounded + overflow sendiri dan isinya dibungkus animasi fade — keduanya
  // membentuk stacking context, jadi panel dengan z-50 sekalipun tetap
  // tertimpa bar nav dan ikut terpotong mengikuti lembarnya.
  if (typeof document === "undefined") return null;

  async function saveNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim() || !contactId) return;
    setBusy(true);
    const r = await fetch(`/api/contacts/${contactId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: note.trim() }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => null);
      alert(j?.error?.message ?? "Catatan gagal disimpan");
      return;
    }
    setNote("");
    load(contactId);
  }

  async function saveTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDate || !contactId) return;
    setBusy(true);
    const r = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactId,
        title: taskTitle.trim(),
        dueDate: new Date(`${taskDate}T09:00:00`).toISOString(),
        priority: "MEDIUM",
      }),
    });
    setBusy(false);
    if (!r.ok) {
      const j = await r.json().catch(() => null);
      alert(j?.error?.message ?? "Tugas gagal dibuat");
      return;
    }
    setTaskTitle("");
    setTaskDate("");
    setTaskOpen(false);
    load(contactId);
  }

  const c = data?.contact;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button type="button" aria-label="Tutup" onClick={onClose} className="flex-1 bg-foreground/40 backdrop-blur-[2px]" />

      <aside className="flex h-full w-full max-w-[520px] flex-col overflow-hidden border-l border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-foreground">{c?.name || "Tanpa nama"}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              +{c?.phone ?? ""}
              {c?.city ? ` · ${c.city}` : ""}
              {data?.stage ? ` · ${data.stage}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-foreground/70 transition hover:border-foreground/30 hover:text-foreground"
            aria-label="Tutup panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading && (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat riwayat...
          </div>
        )}

        {!loading && data && (
          <div className="flex-1 overflow-y-auto">
            {data.optedOut && (
              <p className="border-b border-destructive/20 bg-destructive/10 px-5 py-3 text-sm text-destructive">
                Kontak ini minta berhenti dihubungi. Pengiriman otomatis ke nomor ini sudah dihentikan.
              </p>
            )}

            <div className="grid grid-cols-4 divide-x divide-border border-b border-border text-center">
              {[
                { label: "Masuk", value: String(data.summary.inbound) },
                { label: "Keluar", value: String(data.summary.outbound) },
                { label: "Tugas", value: String(data.summary.openTasks) },
                { label: "Nilai", value: `Rp ${data.summary.wonValue.toLocaleString("id-ID")}` },
              ].map((s) => (
                <div key={s.label} className="px-2 py-3">
                  <p className="truncate text-base font-semibold text-foreground">{s.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 border-b border-border p-4">
              <a
                href={`https://wa.me/${c?.phone}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 items-center gap-1.5 rounded-lg bg-success/10 px-3 text-sm font-semibold text-success transition hover:bg-success/20"
              >
                <MessageSquare className="h-4 w-4" />
                Chat WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setTaskOpen((v) => !v)}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-semibold text-foreground/80 transition hover:border-foreground/30 hover:text-foreground"
              >
                <CheckCircle2 className="h-4 w-4" />
                Buat tugas
              </button>
              {c && c.score > 0 && (
                <span className="flex h-9 items-center rounded-lg border border-border px-3 text-sm text-muted-foreground">
                  Nilai kontak {c.score}
                </span>
              )}
            </div>

            {taskOpen && (
              <form onSubmit={saveTask} className="grid gap-2 border-b border-border bg-muted/40 p-4 sm:grid-cols-[1fr_150px_auto]">
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Mis. telepon ulang besok pagi"
                  className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
                />
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:border-primary/40 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={busy || !taskTitle.trim() || !taskDate}
                  className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-foreground hover:text-background disabled:opacity-40"
                >
                  Simpan
                </button>
              </form>
            )}

            <form onSubmit={saveNote} className="space-y-2 border-b border-border p-4">
              <label className="text-sm font-medium text-foreground">Catatan</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Hasil telepon, keberatan yang muncul, janji yang dibuat..."
                className="w-full rounded-lg border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || !note.trim()}
                className="h-9 rounded-lg border border-border px-3 text-sm font-semibold text-foreground/80 transition hover:border-foreground/30 hover:text-foreground disabled:opacity-40"
              >
                Simpan catatan
              </button>
            </form>

            <div className="p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">Riwayat</p>
              {data.entries.length === 0 && (
                <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Belum ada riwayat. Catatan, pesan, tugas, dan penjualan akan muncul di sini.
                </p>
              )}
              <ol className="space-y-3">
                {data.entries.map((e) => {
                  const style = KIND_STYLE[e.kind];
                  const Icon = style.icon;
                  return (
                    <li key={e.id} className="flex gap-3">
                      <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", style.className)}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1 border-b border-border pb-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground">{e.title}</p>
                          <span className="text-xs text-muted-foreground">{waktu(e.at)}</span>
                        </div>
                        {e.body && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{e.body}</p>}
                        {e.meta && <p className="mt-1 text-xs text-muted-foreground">{e.meta}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}

        {!loading && !data && (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Riwayat kontak gagal dimuat.
          </div>
        )}
      </aside>
    </div>,
    document.body,
  );
}

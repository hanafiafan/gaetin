"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Search, ShieldCheck, Square, SquareCheckBig, StopCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  label: string;
  status: string;
}
interface Contact {
  id: string;
  name: string | null;
  phone: string;
  label: string | null;
  waStatus: "ACTIVE" | "INACTIVE" | "UNKNOWN";
}
interface Progress {
  total: number;
  processed: number;
  active: number;
  inactive: number;
  unverified: number;
  status: string;
}

const SCOPE_LABEL = {
  unknown: "Kontak belum dicek",
  all: "Semua kontak",
  ids: "Kontak terpilih",
};

const WA_LABEL: Record<Contact["waStatus"], string> = {
  ACTIVE: "Aktif",
  INACTIVE: "Tidak aktif",
  UNKNOWN: "Belum dicek",
};

const WA_COLOR: Record<Contact["waStatus"], string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-400",
  INACTIVE: "bg-red-500/15 text-red-400",
  UNKNOWN: "bg-slate-500/15 text-slate-400",
};

export default function ValidatorClient() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState("");
  const [scope, setScope] = useState<"unknown" | "all" | "ids">("unknown");
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [contactsLoading, setContactsLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/whatsapp/accounts");
      const j = await r.json();
      if (j.success) {
        setAccounts(j.data);
        const connected = j.data.find((a: Account) => a.status === "connected");
        if (connected) setAccountId(connected.id);
      }
    })();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const loadContacts = useCallback(async () => {
    if (scope !== "ids") return;
    setContactsLoading(true);
    const params = new URLSearchParams({ page: "1", pageSize: "10" });
    if (query.trim()) params.set("query", query.trim());
    const r = await fetch(`/api/contacts?${params.toString()}`);
    const j = await r.json();
    if (j.success) setContacts(j.data.items);
    setContactsLoading(false);
  }, [query, scope]);

  useEffect(() => {
    const t = setTimeout(loadContacts, 250);
    return () => clearTimeout(t);
  }, [loadContacts]);

  function poll(id: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const r = await fetch(`/api/validator/${id}`);
      const j = await r.json();
      if (j.success) {
        setProgress(j.data);
        if (j.data.status !== "running" && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    }, 1500);
  }

  function toggleContact(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function start() {
    setError(null);
    if (!accountId) { setError("Pilih nomor WhatsApp yang terhubung."); return; }
    if (scope === "ids" && selected.size === 0) { setError("Pilih minimal satu kontak untuk divalidasi."); return; }
    const r = await fetch("/api/validator/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, scope, ids: [...selected] }),
    });
    const j = await r.json();
    if (!r.ok) { setError(j?.error?.message ?? "Gagal memulai validasi"); return; }
    setJobId(j.data.jobId);
    setProgress({ total: j.data.total, processed: 0, active: 0, inactive: 0, unverified: 0, status: "running" });
    poll(j.data.jobId);
  }

  async function stop() {
    if (!jobId) return;
    await fetch(`/api/validator/${jobId}`, { method: "DELETE" });
    setProgress((prev) => (prev ? { ...prev, status: "stopped" } : prev));
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  const connectedAccounts = accounts.filter((a) => a.status === "connected");
  const pct = progress && progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;
  const running = progress?.status === "running";

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="cg-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="font-black text-white">Sesi validasi</h2>
        </div>

        {connectedAccounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.08] p-4 text-sm text-slate-400">
            Belum ada nomor WhatsApp terhubung. Hubungkan dulu di Pengaturan.
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Nomor WhatsApp</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white"
              >
                {connectedAccounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Cakupan</label>
              <select
                value={scope}
                onChange={(e) => { setScope(e.target.value as "unknown" | "all" | "ids"); setError(null); }}
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white"
              >
                <option value="unknown">Hanya yang belum dicek</option>
                <option value="all">Semua kontak</option>
                <option value="ids">Pilih kontak tertentu</option>
              </select>
            </div>

            {scope === "ids" && (
              <div className="space-y-3 rounded-xl border border-white/[0.08] p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari nama, nomor, atau label..."
                    className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {contacts.map((contact) => {
                    const checked = selected.has(contact.id);
                    return (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => toggleContact(contact.id)}
                        className={cn(
                          "flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition",
                          checked ? "border-primary/30 bg-primary/[0.06]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/15"
                        )}
                      >
                        {checked ? (
                          <SquareCheckBig className="h-5 w-5 shrink-0 text-primary" />
                        ) : (
                          <Square className="h-5 w-5 shrink-0 text-slate-500" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-bold text-white">{contact.name ?? `+${contact.phone}`}</span>
                          <span className="block truncate text-xs text-slate-500">
                            +{contact.phone}{contact.label ? ` · ${contact.label}` : ""}
                          </span>
                        </span>
                        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-bold", WA_COLOR[contact.waStatus])}>
                          {WA_LABEL[contact.waStatus]}
                        </span>
                      </button>
                    );
                  })}
                  {contacts.length === 0 && (
                    <div className="p-4 text-center text-sm text-slate-500">
                      {contactsLoading ? "Memuat kontak..." : "Kontak tidak ditemukan."}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{selected.size} kontak dipilih</span>
                  {selected.size > 0 && (
                    <button type="button" onClick={() => setSelected(new Set())} className="text-xs font-bold text-primary hover:underline">
                      Kosongkan
                    </button>
                  )}
                </div>
              </div>
            )}

            {error && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

            {running ? (
              <button onClick={stop} className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-red-500/15 text-sm font-bold text-red-400 transition hover:bg-red-500/25">
                <StopCircle className="h-4 w-4" />
                Hentikan validasi
              </button>
            ) : (
              <button onClick={start} className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/15 text-sm font-bold text-primary transition hover:bg-primary/25">
                <ShieldCheck className="h-4 w-4" />
                Mulai validasi
              </button>
            )}
          </>
        )}
      </div>

      <div className="cg-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-black text-white">Progress</h2>
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", running ? "bg-primary/15 text-primary" : "bg-slate-500/15 text-slate-400")}>
            {progress?.status ?? "idle"}
          </span>
        </div>
        {progress ? (
          <>
            <div className="space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>{progress.processed} / {progress.total} diproses</span>
                <span className="font-bold text-white">{pct}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-400">
                <span className="flex items-center gap-2 font-medium"><CheckCircle2 className="h-4 w-4" /> Aktif WhatsApp</span>
                <strong>{progress.active}</strong>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
                <span className="flex items-center gap-2 font-medium"><XCircle className="h-4 w-4" /> Tidak aktif</span>
                <strong>{progress.inactive}</strong>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3 text-sm text-slate-400">
                <span>Gagal diverifikasi</span>
                <strong>{progress.unverified}</strong>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-white/[0.08] p-4 text-sm text-slate-500">
            Belum ada sesi berjalan. Cakupan saat ini: {SCOPE_LABEL[scope]}.
          </div>
        )}
        {running && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Validasi berjalan dengan jeda acak antar nomor.
          </div>
        )}
      </div>
    </div>
  );
}

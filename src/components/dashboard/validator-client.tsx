"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Search, ShieldCheck, Square, SquareCheckBig, StopCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    if (!accountId) {
      setError("Pilih nomor WhatsApp yang terhubung.");
      return;
    }
    if (scope === "ids" && selected.size === 0) {
      setError("Pilih minimal satu kontak untuk divalidasi.");
      return;
    }
    const r = await fetch("/api/validator/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId, scope, ids: [...selected] }),
    });
    const j = await r.json();
    if (!r.ok) {
      setError(j?.error?.message ?? "Gagal memulai validasi");
      return;
    }
    setJobId(j.data.jobId);
    setProgress({ total: j.data.total, processed: 0, active: 0, inactive: 0, unverified: 0, status: "running" });
    poll(j.data.jobId);
  }

  async function stop() {
    if (!jobId) return;
    await fetch(`/api/validator/${jobId}`, { method: "DELETE" });
    setProgress((prev) => (prev ? { ...prev, status: "stopped" } : prev));
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  const connectedAccounts = accounts.filter((a) => a.status === "connected");
  const pct = progress && progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;
  const running = progress?.status === "running";

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Sesi Validasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectedAccounts.length === 0 ? (
            <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
              Belum ada nomor WhatsApp terhubung. Hubungkan dulu di Pengaturan.
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium">Nomor WhatsApp</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {connectedAccounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Cakupan</label>
                <select
                  value={scope}
                  onChange={(e) => {
                    const value = e.target.value as "unknown" | "all" | "ids";
                    setScope(value);
                    setError(null);
                  }}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="unknown">Hanya yang belum dicek</option>
                  <option value="all">Semua kontak</option>
                  <option value="ids">Pilih kontak tertentu</option>
                </select>
              </div>

              {scope === "ids" && (
                <div className="space-y-3 rounded-md border p-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Cari nama, nomor, atau label..."
                      className="pl-9"
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
                            "flex min-h-14 w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50",
                            checked && "border-primary bg-primary/5",
                          )}
                        >
                          {checked ? (
                            <SquareCheckBig className="h-5 w-5 shrink-0 text-primary" />
                          ) : (
                            <Square className="h-5 w-5 shrink-0 text-muted-foreground" />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{contact.name ?? `+${contact.phone}`}</span>
                            <span className="block truncate text-muted-foreground">
                              +{contact.phone}{contact.label ? ` - ${contact.label}` : ""}
                            </span>
                          </span>
                          <Badge variant="outline" className="shrink-0">
                            {WA_LABEL[contact.waStatus]}
                          </Badge>
                        </button>
                      );
                    })}
                    {contacts.length === 0 && (
                      <div className="rounded-md bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                        {contactsLoading ? "Memuat kontak..." : "Kontak tidak ditemukan."}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{selected.size} kontak dipilih</span>
                    {selected.size > 0 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                        Kosongkan
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

              {running ? (
                <Button variant="destructive" onClick={stop}>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Hentikan
                </Button>
              ) : (
                <Button onClick={start}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Mulai validasi
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-base">
            Progress
            <Badge variant={running ? "default" : "outline"}>{progress?.status ?? "idle"}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {progress ? (
            <>
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{progress.processed} / {progress.total} diproses</span>
                  <span>{pct}%</span>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between rounded-md bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Aktif WhatsApp</span>
                  <strong>{progress.active}</strong>
                </div>
                <div className="flex items-center justify-between rounded-md bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
                  <span className="flex items-center gap-2"><XCircle className="h-4 w-4" /> Tidak aktif</span>
                  <strong>{progress.inactive}</strong>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  <span>Gagal diverifikasi</span>
                  <strong>{progress.unverified}</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-md bg-muted/30 p-4 text-sm text-muted-foreground">
              Belum ada sesi berjalan. Cakupan saat ini: {SCOPE_LABEL[scope]}.
            </div>
          )}
          {running && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Validasi berjalan dengan jeda acak antar nomor.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Filter, Loader2, Plus, Search, Tag, Trash2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string | null;
  phone: string;
  label: string | null;
  email: string | null;
  city: string | null;
  category: string | null;
  waStatus: "ACTIVE" | "INACTIVE" | "UNKNOWN";
  score: number;
}

const WA_BADGE: Record<Contact["waStatus"], string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-400",
  INACTIVE: "bg-red-500/15 text-red-400",
  UNKNOWN: "bg-slate-500/15 text-muted-foreground",
};
const WA_LABEL: Record<Contact["waStatus"], string> = {
  ACTIVE: "Aktif WA",
  INACTIVE: "Tidak aktif",
  UNKNOWN: "Belum dicek",
};

function scoreClass(score: number): string {
  if (score >= 75) return "bg-emerald-500/15 text-emerald-400";
  if (score >= 55) return "bg-amber-500/15 text-amber-400";
  return "bg-slate-500/15 text-muted-foreground";
}

export default function ContactsTable() {
  const [items, setItems] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [query, setQuery] = useState("");
  const [waStatus, setWaStatus] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (query) params.set("query", query);
    if (waStatus) params.set("waStatus", waStatus);
    const res = await fetch(`/api/contacts?${params.toString()}`);
    const json = await res.json();
    if (json.success) { setItems(json.data.items); setTotal(json.data.total); }
    setSelected(new Set());
    setLoading(false);
  }, [page, query, waStatus]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const summary = useMemo(() => ({
    active: items.filter((i) => i.waStatus === "ACTIVE").length,
    unknown: items.filter((i) => i.waStatus === "UNKNOWN").length,
  }), [items]);

  function toggle(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAll() {
    setSelected((prev) => (prev.size === items.length ? new Set() : new Set(items.map((i) => i.id))));
  }

  async function addContact(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!phone.trim()) return;
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    const json = await res.json();
    if (!res.ok) { setFormError(json?.error?.message ?? "Gagal menambah kontak"); return; }
    setName(""); setPhone(""); setPage(1); load();
  }

  async function bulkDelete() {
    if (!confirm(`Hapus ${selected.size} kontak?`)) return;
    await fetch("/api/contacts/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], action: "delete" }),
    });
    load();
  }

  async function bulkTag() {
    const label = window.prompt("Beri label untuk kontak terpilih:");
    if (label === null) return;
    await fetch("/api/contacts/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], action: "tag", label }),
    });
    load();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Stats */}
        <div className="cg-card rounded-2xl p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-card p-4">
              <p className="text-xs font-bold uppercase text-muted-foreground">Total database</p>
              <p className="mt-1 text-2xl font-black text-foreground">{total.toLocaleString("id-ID")}</p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-4">
              <p className="text-xs font-bold uppercase text-emerald-400">Aktif di halaman ini</p>
              <p className="mt-1 text-2xl font-black text-foreground">{summary.active}</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-4">
              <p className="text-xs font-bold uppercase text-amber-400">Belum dicek</p>
              <p className="mt-1 text-2xl font-black text-foreground">{summary.unknown}</p>
            </div>
          </div>
        </div>

        {/* Quick add */}
        <div className="cg-card rounded-2xl p-4">
          <form onSubmit={addContact} className="space-y-3">
            <div>
              <p className="font-bold text-foreground">Tambah cepat</p>
              <p className="text-xs text-muted-foreground">Masukkan prospek manual tanpa keluar dari halaman.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama (opsional)"
                className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
              />
            </div>
            {formError && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</div>}
            <button
              type="submit"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/15 text-sm font-bold text-primary transition hover:bg-primary/25"
            >
              <Plus className="h-4 w-4" />
              Tambah kontak
            </button>
          </form>
        </div>
      </div>

      <div className="cg-card rounded-2xl">
        <div className="space-y-3 p-4">
          {/* Search + filter */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => { setPage(1); setQuery(e.target.value); }}
                placeholder="Cari nama, nomor, email, atau label..."
                className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={waStatus}
                  onChange={(e) => { setPage(1); setWaStatus(e.target.value); }}
                  className="bg-transparent text-sm text-foreground outline-none"
                >
                  <option value="">Semua status WA</option>
                  <option value="ACTIVE">Aktif WA</option>
                  <option value="INACTIVE">Tidak aktif</option>
                  <option value="UNKNOWN">Belum dicek</option>
                </select>
              </div>
              {loading && (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Memuat
                </span>
              )}
            </div>
          </div>

          {/* Bulk actions */}
          {selected.size > 0 && (
            <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-bold text-primary">{selected.size} kontak dipilih</span>
              <div className="flex gap-2">
                <button
                  onClick={bulkTag}
                  className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-bold text-foreground/80 transition hover:border-primary/30 hover:text-primary"
                >
                  <Tag className="h-3.5 w-3.5" /> Label
                </button>
                <button
                  onClick={bulkDelete}
                  className="flex h-8 items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 text-xs font-bold text-red-400 transition hover:bg-red-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-y border-border bg-muted/50">
                <th className="w-12 p-3">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selected.size === items.length}
                    onChange={toggleAll}
                    aria-label="Pilih semua"
                    className="h-4 w-4 cursor-pointer accent-primary"
                  />
                </th>
                {["Kontak", "Telepon", "Lokasi", "Kategori", "Skor", "Status WA"].map((h) => (
                  <th key={h} className={cn("p-3 text-xs font-bold uppercase text-muted-foreground", h === "Skor" && "text-center")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((contact) => (
                <tr key={contact.id} className="border-b border-border/50 last:border-0 hover:bg-card">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(contact.id)}
                      onChange={() => toggle(contact.id)}
                      aria-label={`Pilih ${contact.name ?? contact.phone}`}
                      className="h-4 w-4 cursor-pointer accent-primary"
                    />
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-foreground">{contact.name ?? "Tanpa nama"}</p>
                    <p className="text-xs text-muted-foreground">{contact.email ?? contact.label ?? "Belum ada detail tambahan"}</p>
                  </td>
                  <td className="p-3 font-medium text-foreground/80">+{contact.phone}</td>
                  <td className="p-3 text-muted-foreground">{contact.city ?? "-"}</td>
                  <td className="p-3">
                    {contact.category ? (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/80">{contact.category}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", scoreClass(contact.score))}>
                      {contact.score}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold", WA_BADGE[contact.waStatus])}>
                      {contact.waStatus === "ACTIVE" ? <CheckCircle2 className="h-3.5 w-3.5" /> : contact.waStatus === "INACTIVE" ? <XCircle className="h-3.5 w-3.5" /> : null}
                      {WA_LABEL[contact.waStatus]}
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="p-10 text-center">
                    <p className="font-bold text-foreground">Belum ada kontak yang cocok</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tambahkan manual, impor CSV/Excel, atau ambil lead dari Scraper.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages} · {total.toLocaleString("id-ID")} total kontak
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 rounded-full border border-border px-3 text-xs font-bold text-foreground/80 transition hover:border-primary/30 hover:text-primary disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 rounded-full border border-border px-3 text-xs font-bold text-foreground/80 transition hover:border-primary/30 hover:text-primary disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

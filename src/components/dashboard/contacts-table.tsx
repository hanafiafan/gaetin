"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Filter, Loader2, Plus, Search, Tag, Trash2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  ACTIVE: "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400",
  INACTIVE: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
  UNKNOWN: "border-border bg-muted text-muted-foreground",
};
const WA_LABEL: Record<Contact["waStatus"], string> = {
  ACTIVE: "Aktif WA",
  INACTIVE: "Tidak aktif",
  UNKNOWN: "Belum dicek",
};

function scoreClass(score: number): string {
  if (score >= 75) return "bg-green-500/10 text-green-700 dark:text-green-400";
  if (score >= 55) return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
  return "bg-muted text-muted-foreground";
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
    if (json.success) {
      setItems(json.data.items);
      setTotal(json.data.total);
    }
    setSelected(new Set());
    setLoading(false);
  }, [page, query, waStatus]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const summary = useMemo(() => {
    const active = items.filter((item) => item.waStatus === "ACTIVE").length;
    const unknown = items.filter((item) => item.waStatus === "UNKNOWN").length;
    return { active, unknown };
  }, [items]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === items.length ? new Set() : new Set(items.map((item) => item.id))));
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
    if (!res.ok) {
      setFormError(json?.error?.message ?? "Gagal menambah kontak");
      return;
    }
    setName("");
    setPhone("");
    setPage(1);
    load();
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
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-muted/40 p-4">
                <div className="text-xs font-medium text-muted-foreground">Total database</div>
                <div className="mt-1 text-2xl font-semibold">{total.toLocaleString("id-ID")}</div>
              </div>
              <div className="rounded-xl bg-green-500/10 p-4 text-green-700 dark:text-green-400">
                <div className="text-xs font-medium">Aktif di halaman ini</div>
                <div className="mt-1 text-2xl font-semibold">{summary.active}</div>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-4 text-amber-700 dark:text-amber-400">
                <div className="text-xs font-medium">Belum dicek</div>
                <div className="mt-1 text-2xl font-semibold">{summary.unknown}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4">
            <form onSubmit={addContact} className="space-y-3">
              <div>
                <div className="text-sm font-semibold">Tambah cepat</div>
                <p className="text-xs text-muted-foreground">Masukkan prospek manual tanpa keluar dari halaman.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama (opsional)" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
              </div>
              {formError && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</div>}
              <Button type="submit" className="w-full rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                Tambah kontak
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setPage(1);
                  setQuery(e.target.value);
                }}
                placeholder="Cari nama, nomor, email, atau label..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={waStatus}
                  onChange={(e) => {
                    setPage(1);
                    setWaStatus(e.target.value);
                  }}
                  className="bg-transparent outline-none"
                >
                  <option value="">Semua status WA</option>
                  <option value="ACTIVE">Aktif WA</option>
                  <option value="INACTIVE">Tidak aktif</option>
                  <option value="UNKNOWN">Belum dicek</option>
                </select>
              </div>
              {loading && (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat
                </span>
              )}
            </div>
          </div>

          {selected.size > 0 && (
            <div className="flex flex-col gap-3 rounded-xl border bg-primary/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-semibold text-primary">{selected.size} kontak dipilih</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={bulkTag}>
                  <Tag className="mr-2 h-4 w-4" />
                  Label
                </Button>
                <Button size="sm" variant="destructive" onClick={bulkDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                    <th className="w-12 p-3">
                      <input
                        type="checkbox"
                        checked={items.length > 0 && selected.size === items.length}
                        onChange={toggleAll}
                        aria-label="Pilih semua"
                      />
                    </th>
                    <th className="p-3">Kontak</th>
                    <th className="p-3">Telepon</th>
                    <th className="p-3">Lokasi</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-center">Skor</th>
                    <th className="p-3">Status WA</th>
                  </tr>
                </thead>
                <tbody className="bg-card">
                  {items.map((contact) => (
                    <tr key={contact.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.has(contact.id)}
                          onChange={() => toggle(contact.id)}
                          aria-label={`Pilih ${contact.name ?? contact.phone}`}
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-semibold">{contact.name ?? "Tanpa nama"}</div>
                        <div className="text-xs text-muted-foreground">{contact.email ?? contact.label ?? "Belum ada detail tambahan"}</div>
                      </td>
                      <td className="p-3 font-medium text-muted-foreground">+{contact.phone}</td>
                      <td className="p-3 text-muted-foreground">{contact.city ?? "-"}</td>
                      <td className="p-3">
                        {contact.category ? <Badge variant="outline">{contact.category}</Badge> : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="p-3 text-center">
                        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", scoreClass(contact.score))}>
                          {contact.score}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", WA_BADGE[contact.waStatus])}>
                          {contact.waStatus === "ACTIVE" ? <CheckCircle2 className="h-3.5 w-3.5" /> : contact.waStatus === "INACTIVE" ? <XCircle className="h-3.5 w-3.5" /> : null}
                          {WA_LABEL[contact.waStatus]}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} className="p-10 text-center">
                        <div className="mx-auto max-w-sm">
                          <div className="text-base font-semibold">Belum ada kontak yang cocok</div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Tambahkan manual, impor CSV/Excel, atau ambil lead dari Scraper.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Sebelumnya
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Berikutnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

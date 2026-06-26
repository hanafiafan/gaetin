"use client";

import { useEffect, useState } from "react";
import { Building2, Download, Filter, MapPin, Phone, Search, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

interface Lead {
  id: string;
  businessName: string;
  phone: string | null;
  address: string | null;
  category: string | null;
  rating: number | null;
  reviewCount: number | null;
  website: string | null;
  saved: boolean;
  createdAt: string;
  workspace: { name: string };
}

interface Workspace { id: string; name: string }

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [wsFilter, setWsFilter] = useState("");
  const [search, setSearch] = useState("");
  const [hasPhone, setHasPhone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 200;

  async function load(reset = false) {
    setLoading(true);
    const o = reset ? 0 : offset;
    const params = new URLSearchParams({ limit: String(LIMIT), offset: String(o) });
    if (wsFilter) params.set("workspaceId", wsFilter);
    if (search.trim()) params.set("search", search.trim());
    if (hasPhone) params.set("hasPhone", "true");
    const r = await fetch(`/api/admin/leads?${params}`);
    const j = await r.json();
    if (j.success) {
      setLeads(j.data.items);
      setTotal(j.data.total);
      if (reset) setOffset(0);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetch("/api/admin/workspaces").then(r => r.json()).then(j => {
      if (j.success) setWorkspaces(j.data);
    });
  }, []);

  useEffect(() => { load(true); }, [wsFilter, hasPhone]);

  function exportCsv() {
    const header = ["businessName","phone","category","rating","address","website","workspace","createdAt"];
    const rows = leads.map(l => [
      l.businessName, l.phone ?? "", l.category ?? "", l.rating ?? "",
      l.address ?? "", l.website ?? "", l.workspace.name, l.createdAt,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `admin-leads-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Data Scraping</h1>
          <p className="text-sm text-muted-foreground">Semua lead hasil scraping dari seluruh workspace. Total: {total.toLocaleString("id-ID")}</p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border bg-muted/20 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && load(true)} placeholder="Cari bisnis, kategori, nomor..." className="pl-9" />
        </div>
        <select value={wsFilter} onChange={e => setWsFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">Semua workspace</option>
          {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <label className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm cursor-pointer">
          <input type="checkbox" checked={hasPhone} onChange={e => setHasPhone(e.target.checked)} />
          Ada nomor
        </label>
        <Button onClick={() => load(true)} variant="outline" size="sm" className="h-10">
          <Filter className="mr-1.5 h-4 w-4" />Cari
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="p-3">Bisnis</th>
                <th className="p-3">Nomor</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Workspace</th>
                <th className="p-3">Waktu</th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {loading && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Memuat...</td></tr>
              )}
              {!loading && leads.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Tidak ada data.</td></tr>
              )}
              {leads.map(l => (
                <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="font-medium">{l.businessName}</div>
                    {l.address && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{l.address.slice(0, 60)}</div>}
                    {l.website && <div className="text-xs text-primary mt-0.5 truncate max-w-[200px]">{l.website}</div>}
                  </td>
                  <td className="p-3">
                    {l.phone ? (
                      <span className="inline-flex items-center gap-1 text-green-600"><Phone className="h-3.5 w-3.5" />+{l.phone}</span>
                    ) : <span className="text-muted-foreground">-</span>}
                  </td>
                  <td className="p-3">
                    {l.rating ? (
                      <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500" />{l.rating}{l.reviewCount ? ` (${l.reviewCount})` : ""}</span>
                    ) : "-"}
                  </td>
                  <td className="p-3">
                    {l.category ? <Badge variant="outline">{l.category}</Badge> : "-"}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-muted-foreground"><Building2 className="h-3.5 w-3.5" />{l.workspace.name}</span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {total > LIMIT && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Menampilkan {offset + 1}–{Math.min(offset + LIMIT, total)} dari {total.toLocaleString("id-ID")}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={offset === 0} onClick={() => { setOffset(Math.max(0, offset - LIMIT)); load(); }}>Prev</Button>
            <Button size="sm" variant="outline" disabled={offset + LIMIT >= total} onClick={() => { setOffset(offset + LIMIT); load(); }}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

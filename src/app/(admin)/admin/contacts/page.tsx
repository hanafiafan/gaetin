"use client";

import { useEffect, useState } from "react";
import { Building2, Filter, MessageCircle, Phone, Search, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

interface Contact {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  category: string | null;
  waStatus: string;
  crmStage: string | null;
  label: string | null;
  score: number;
  lastContacted: string | null;
  createdAt: string;
  workspace: { name: string };
}

interface Workspace { id: string; name: string }

const WA_BADGE: Record<string, string> = {
  ACTIVE: "bg-green-500/10 text-green-600",
  INACTIVE: "bg-red-500/10 text-red-600",
  UNKNOWN: "bg-muted text-muted-foreground",
};

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
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
    const r = await fetch(`/api/admin/contacts?${params}`);
    const j = await r.json();
    if (j.success) {
      setContacts(j.data.items);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Kontak & Nomor</h1>
        <p className="text-sm text-muted-foreground">Semua nomor yang telah dimasukkan ke kontak. Total: {total.toLocaleString("id-ID")}</p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border bg-muted/20 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && load(true)} placeholder="Cari nama, nomor, email..." className="pl-9" />
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
                <th className="p-3">Kontak</th>
                <th className="p-3">Nomor WA</th>
                <th className="p-3">Status WA</th>
                <th className="p-3">CRM Stage</th>
                <th className="p-3">Workspace</th>
                <th className="p-3">Bergabung</th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {loading && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Memuat...</td></tr>}
              {!loading && contacts.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Tidak ada kontak.</td></tr>}
              {contacts.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="font-medium">{c.name ?? "(tanpa nama)"}</div>
                    {c.email && <div className="text-xs text-muted-foreground">{c.email}</div>}
                    {c.category && <Badge variant="outline" className="mt-1 text-xs">{c.category}</Badge>}
                    {c.label && <span className="ml-1 inline-flex items-center gap-0.5 text-xs text-muted-foreground"><Tag className="h-3 w-3" />{c.label}</span>}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 font-mono text-sm">
                      <Phone className="h-3.5 w-3.5 text-green-500" />+{c.phone}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${WA_BADGE[c.waStatus] || WA_BADGE.UNKNOWN}`}>
                      <MessageCircle className="h-3 w-3" />{c.waStatus}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{c.crmStage ?? "-"}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-muted-foreground"><Building2 className="h-3.5 w-3.5" />{c.workspace.name}</span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString("id-ID")}
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

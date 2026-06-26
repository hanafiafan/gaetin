"use client";

import { useEffect, useState } from "react";
import { Building2, Filter, MessageCircle, Phone, Search, Tag } from "lucide-react";

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
  ACTIVE: "bg-emerald-500/15 text-emerald-400",
  INACTIVE: "bg-red-500/15 text-red-400",
  UNKNOWN: "bg-white/[0.06] text-slate-400",
};

const SELECT_CLASS = "h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white";

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
        <h1 className="text-2xl font-bold text-white">Kontak & Nomor</h1>
        <p className="text-sm text-slate-400">Semua nomor yang telah dimasukkan ke kontak. Total: {total.toLocaleString("id-ID")}</p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && load(true)} placeholder="Cari nama, nomor, email..." className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none" />
        </div>
        <select value={wsFilter} onChange={e => setWsFilter(e.target.value)} className={SELECT_CLASS}>
          <option value="">Semua workspace</option>
          {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-slate-300">
          <input type="checkbox" checked={hasPhone} onChange={e => setHasPhone(e.target.checked)} className="accent-primary" />
          Ada nomor
        </label>
        <button onClick={() => load(true)} className="flex h-10 items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 text-sm font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary">
          <Filter className="h-4 w-4" />Cari
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.08]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03] text-left text-xs uppercase text-slate-500">
                <th className="p-3">Kontak</th>
                <th className="p-3">Nomor WA</th>
                <th className="p-3">Status WA</th>
                <th className="p-3">CRM Stage</th>
                <th className="p-3">Workspace</th>
                <th className="p-3">Bergabung</th>
              </tr>
            </thead>
            <tbody className="bg-white/[0.01]">
              {loading && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Memuat...</td></tr>}
              {!loading && contacts.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Tidak ada kontak.</td></tr>}
              {contacts.map(c => (
                <tr key={c.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                  <td className="p-3">
                    <div className="font-medium text-white">{c.name ?? "(tanpa nama)"}</div>
                    {c.email && <div className="text-xs text-slate-500">{c.email}</div>}
                    {c.category && <span className="mt-1 inline-block rounded-full border border-white/[0.08] px-2 py-0.5 text-xs text-slate-400">{c.category}</span>}
                    {c.label && <span className="ml-1 inline-flex items-center gap-0.5 text-xs text-slate-500"><Tag className="h-3 w-3" />{c.label}</span>}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 font-mono text-sm text-slate-300">
                      <Phone className="h-3.5 w-3.5 text-emerald-400" />+{c.phone}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${WA_BADGE[c.waStatus] || WA_BADGE.UNKNOWN}`}>
                      <MessageCircle className="h-3 w-3" />{c.waStatus}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{c.crmStage ?? "-"}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-slate-400"><Building2 className="h-3.5 w-3.5" />{c.workspace.name}</span>
                  </td>
                  <td className="whitespace-nowrap p-3 text-xs text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {total > LIMIT && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Menampilkan {offset + 1}–{Math.min(offset + LIMIT, total)} dari {total.toLocaleString("id-ID")}</span>
          <div className="flex gap-2">
            <button disabled={offset === 0} onClick={() => { setOffset(Math.max(0, offset - LIMIT)); load(); }} className="flex h-8 items-center rounded-lg border border-white/[0.08] px-3 text-xs font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary disabled:opacity-40">Prev</button>
            <button disabled={offset + LIMIT >= total} onClick={() => { setOffset(offset + LIMIT); load(); }} className="flex h-8 items-center rounded-lg border border-white/[0.08] px-3 text-xs font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

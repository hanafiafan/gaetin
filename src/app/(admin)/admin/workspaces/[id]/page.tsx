"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, BarChart3, CreditCard, Database, Loader2,
  MessageCircle, Phone, Radar, RefreshCw, Shield, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface WorkspaceDetail {
  workspace: {
    id: string; name: string; slug: string; credits: number;
    subscription: { plan: string; status: string; trialEndsAt: string | null; currentPeriodEnd: string | null } | null;
    memberships: { role: string; user: { id: string; name: string; email: string } }[];
  };
  stats: { leads: number; contacts: number };
  scraperJobs: { id: string; keyword: string; name: string | null; status: string; totalFound: number; createdAt: string }[];
  blasts: { id: string; name: string | null; status: string; recipientCount: number; createdAt: string }[];
  creditLedger: { id: string; amount: number; kind: string; note: string | null; createdAt: string }[];
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-green-500/15 text-green-600",
  TRIAL: "bg-amber-500/15 text-amber-600",
  EXPIRED: "bg-red-500/15 text-red-600",
  BLOCKED: "bg-red-600/15 text-red-700",
  CANCELLED: "bg-muted text-muted-foreground",
  COMPLETED: "bg-green-500/15 text-green-600",
  RUNNING: "bg-blue-500/15 text-blue-600",
  FAILED: "bg-red-500/15 text-red-600",
  STOPPED: "bg-muted text-muted-foreground",
  SENT: "bg-green-500/15 text-green-600",
  DRAFT: "bg-muted text-muted-foreground",
  SENDING: "bg-blue-500/15 text-blue-600",
};

const PLAN_LABEL: Record<string, string> = { STARTER: "Starter", GROWTH: "Bisnis", PRO: "Pro" };

export default function WorkspaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<WorkspaceDetail | null>(null);
  const [tab, setTab] = useState<"overview" | "scraper" | "blasts" | "credits">("overview");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch(`/api/admin/workspaces/${id}`);
    const j = await r.json();
    if (j.success) setData(j.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function act(body: Record<string, unknown>) {
    await fetch(`/api/admin/workspaces/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  function addCredits() {
    const v = window.prompt("Tambah/kurang kredit (boleh negatif):", "100");
    if (v === null) return;
    act({ action: "addCredits", credits: Number(v) || 0 });
  }

  async function impersonate() {
    await fetch(`/api/admin/workspaces/${id}/impersonate`, { method: "POST" });
    window.location.href = "/dashboard";
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  );
  if (!data) return <div className="text-muted-foreground">Workspace tidak ditemukan.</div>;

  const { workspace, stats, scraperJobs, blasts, creditLedger } = data;
  const sub = workspace.subscription;
  const owner = workspace.memberships.find(m => m.role === "OWNER")?.user;
  const creditBalance = creditLedger.reduce((s, l) => s + l.amount, workspace.credits);

  const TABS = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "scraper", label: `Scraping (${scraperJobs.length})`, icon: Radar },
    { key: "blasts", label: `Blast (${blasts.length})`, icon: MessageCircle },
    { key: "credits", label: "Kredit", icon: CreditCard },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/workspaces")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />Kembali
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{workspace.name}</h1>
          <p className="text-sm text-muted-foreground">/{workspace.slug} · {owner?.email}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={load}><RefreshCw className="mr-1.5 h-4 w-4" />Refresh</Button>
          <Button size="sm" variant="outline" onClick={addCredits}><CreditCard className="mr-1.5 h-4 w-4" />Kredit</Button>
          <select
            value={sub?.plan ?? "STARTER"}
            onChange={e => act({ action: "setPlan", plan: e.target.value })}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="STARTER">Starter</option>
            <option value="GROWTH">Bisnis</option>
            <option value="PRO">Pro</option>
          </select>
          <select
            value={sub?.status ?? "TRIAL"}
            onChange={e => act({ action: "setStatus", status: e.target.value })}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="TRIAL">Trial</option>
            <option value="ACTIVE">Aktif</option>
            <option value="EXPIRED">Kedaluwarsa</option>
            <option value="BLOCKED">Suspend</option>
            <option value="CANCELLED">Batal</option>
          </select>
          <Button size="sm" onClick={impersonate}><Shield className="mr-1.5 h-4 w-4" />Masuk sebagai user</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Lead scraping", value: stats.leads.toLocaleString("id-ID"), icon: Database },
          { label: "Kontak", value: stats.contacts.toLocaleString("id-ID"), icon: Users },
          { label: "Kredit saldo", value: workspace.credits.toLocaleString("id-ID"), icon: CreditCard },
          { label: "Paket", value: PLAN_LABEL[sub?.plan ?? "STARTER"] ?? sub?.plan, icon: BarChart3 },
        ].map(c => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{c.label}</div>
                <c.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-1 text-2xl font-semibold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription info */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Status langganan</div>
            <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", STATUS_COLOR[sub?.status ?? "TRIAL"] ?? STATUS_COLOR.TRIAL)}>
              {sub?.status ?? "TRIAL"}
            </span>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Paket</div>
            <Badge variant="outline">{PLAN_LABEL[sub?.plan ?? "STARTER"] ?? sub?.plan}</Badge>
          </div>
          {sub?.trialEndsAt && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Trial berakhir</div>
              <div className="text-sm">{new Date(sub.trialEndsAt).toLocaleDateString("id-ID")}</div>
            </div>
          )}
          {sub?.currentPeriodEnd && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Periode berakhir</div>
              <div className="text-sm">{new Date(sub.currentPeriodEnd).toLocaleDateString("id-ID")}</div>
            </div>
          )}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Owner</div>
            <div className="text-sm">{owner?.name} · {owner?.email}</div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm">Anggota tim</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workspace.memberships.map(m => (
                  <div key={m.user.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{m.user.name}</div>
                      <div className="text-xs text-muted-foreground">{m.user.email}</div>
                    </div>
                    <Badge variant="outline">{m.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Scraping terbaru</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scraperJobs.slice(0, 5).map(j => (
                  <div key={j.id} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{j.name ?? j.keyword}</div>
                      <div className="text-xs text-muted-foreground">{j.totalFound} lead</div>
                    </div>
                    <span className={cn("ml-2 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", STATUS_COLOR[j.status] ?? STATUS_COLOR.STOPPED)}>{j.status}</span>
                  </div>
                ))}
                {scraperJobs.length === 0 && <div className="text-sm text-muted-foreground">Belum ada scraping.</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "scraper" && (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="p-3">Job</th>
                <th className="p-3 text-center">Lead</th>
                <th className="p-3">Status</th>
                <th className="p-3">Waktu</th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {scraperJobs.map(j => (
                <tr key={j.id} className="border-b last:border-0">
                  <td className="p-3">
                    <div className="font-medium">{j.name ?? j.keyword}</div>
                    <div className="text-xs text-muted-foreground">{j.keyword}</div>
                  </td>
                  <td className="p-3 text-center font-semibold">{j.totalFound}</td>
                  <td className="p-3"><span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_COLOR[j.status] ?? STATUS_COLOR.STOPPED)}>{j.status}</span></td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(j.createdAt).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
              {scraperJobs.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Belum ada scraping.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "blasts" && (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="p-3">Blast</th>
                <th className="p-3 text-center">Penerima</th>
                <th className="p-3">Status</th>
                <th className="p-3">Waktu</th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {blasts.map(b => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{b.name ?? "(tanpa nama)"}</td>
                  <td className="p-3 text-center"><span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{b.recipientCount}</span></td>
                  <td className="p-3"><span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_COLOR[b.status] ?? STATUS_COLOR.DRAFT)}>{b.status}</span></td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
              {blasts.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Belum ada blast.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "credits" && (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="p-3">Keterangan</th>
                <th className="p-3">Jenis</th>
                <th className="p-3 text-right">Jumlah</th>
                <th className="p-3">Waktu</th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {creditLedger.map(l => (
                <tr key={l.id} className="border-b last:border-0">
                  <td className="p-3 text-muted-foreground">{l.note ?? "-"}</td>
                  <td className="p-3"><Badge variant="outline" className="text-xs">{l.kind}</Badge></td>
                  <td className={cn("p-3 text-right font-semibold tabular-nums", l.amount >= 0 ? "text-green-600" : "text-red-600")}>
                    {l.amount >= 0 ? "+" : ""}{l.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(l.createdAt).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
              {creditLedger.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Belum ada riwayat kredit.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

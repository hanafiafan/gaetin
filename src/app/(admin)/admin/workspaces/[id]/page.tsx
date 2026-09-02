"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, BarChart3, CreditCard, Database, Loader2,
  MessageCircle, Phone, Radar, RefreshCw, Shield, Users,
} from "lucide-react";
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
  blasts: { id: string; name: string | null; status: string; totalRecipients: number; createdAt: string }[];
  creditLedger: { id: string; amount: number; reason: string; balanceAfter: number; createdAt: string }[];
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-success/15 text-success",
  TRIAL: "bg-warning/15 text-warning",
  EXPIRED: "bg-destructive/15 text-destructive",
  BLOCKED: "bg-destructive/15 text-destructive",
  CANCELLED: "bg-muted text-muted-foreground",
  COMPLETED: "bg-success/15 text-success",
  RUNNING: "bg-primary/ text-foreground",
  FAILED: "bg-destructive/15 text-destructive",
  STOPPED: "bg-muted text-muted-foreground",
  SENT: "bg-success/15 text-success",
  DRAFT: "bg-muted text-muted-foreground",
  SENDING: "bg-primary/ text-foreground",
};

const PLAN_LABEL: Record<string, string> = { STARTER: "Starter", GROWTH: "Bisnis", PRO: "Pro" };
const SELECT_CLASS = "h-9 rounded-xl border border-border bg-muted px-2 text-sm text-foreground";

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
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
  if (!data) return <div className="text-muted-foreground">Workspace tidak ditemukan.</div>;

  const { workspace, stats, scraperJobs, blasts, creditLedger } = data;
  const sub = workspace.subscription;
  const owner = workspace.memberships.find((m) => m.role === "OWNER")?.user;

  const TABS = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "scraper", label: `Scraping (${scraperJobs.length})`, icon: Radar },
    { key: "blasts", label: `Blast (${blasts.length})`, icon: MessageCircle },
    { key: "credits", label: "Kredit", icon: CreditCard },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => router.push("/admin/workspaces")} className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-bold text-foreground transition hover:border-primary/30 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{workspace.name}</h1>
          <p className="text-sm text-muted-foreground">/{workspace.slug} · {owner?.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={load} className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-bold text-foreground transition hover:border-primary/30 hover:text-foreground">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={addCredits} className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-bold text-foreground transition hover:border-border">
            <CreditCard className="h-4 w-4" /> Kredit
          </button>
          <select value={sub?.plan ?? "STARTER"} onChange={(e) => act({ action: "setPlan", plan: e.target.value })} className={SELECT_CLASS}>
            <option value="STARTER">Starter</option>
            <option value="GROWTH">Bisnis</option>
            <option value="PRO">Pro</option>
          </select>
          <select value={sub?.status ?? "TRIAL"} onChange={(e) => act({ action: "setStatus", status: e.target.value })} className={SELECT_CLASS}>
            <option value="TRIAL">Trial</option>
            <option value="ACTIVE">Aktif</option>
            <option value="EXPIRED">Kedaluwarsa</option>
            <option value="BLOCKED">Suspend</option>
            <option value="CANCELLED">Batal</option>
          </select>
          <button onClick={impersonate} className="flex h-9 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-4 text-sm font-bold text-foreground transition hover:bg-primary/25">
            <Shield className="h-4 w-4" /> Masuk sebagai user
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Lead scraping", value: stats.leads.toLocaleString("id-ID"), icon: Database },
          { label: "Kontak", value: stats.contacts.toLocaleString("id-ID"), icon: Users },
          { label: "Kredit saldo", value: workspace.credits.toLocaleString("id-ID"), icon: CreditCard },
          { label: "Paket", value: PLAN_LABEL[sub?.plan ?? "STARTER"] ?? sub?.plan, icon: BarChart3 },
        ].map((c) => (
          <div key={c.label} className="cg-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{c.label}</div>
              <c.icon className="h-4 w-4 text-foreground" />
            </div>
            <div className="mt-1 text-2xl font-bold text-foreground">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Subscription info */}
      <div className="cg-card flex flex-wrap items-center gap-6 rounded-2xl p-4">
        <div>
          <div className="mb-1 text-xs text-muted-foreground">Status langganan</div>
          <span className={cn("rounded-full px-3 py-1 text-xs font-bold", STATUS_BADGE[sub?.status ?? "TRIAL"] ?? STATUS_BADGE.TRIAL)}>
            {sub?.status ?? "TRIAL"}
          </span>
        </div>
        <div>
          <div className="mb-1 text-xs text-muted-foreground">Paket</div>
          <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-foreground">
            {PLAN_LABEL[sub?.plan ?? "STARTER"] ?? sub?.plan}
          </span>
        </div>
        {sub?.trialEndsAt && (
          <div>
            <div className="mb-1 text-xs text-muted-foreground">Trial berakhir</div>
            <div className="text-sm text-foreground">{new Date(sub.trialEndsAt).toLocaleDateString("id-ID")}</div>
          </div>
        )}
        {sub?.currentPeriodEnd && (
          <div>
            <div className="mb-1 text-xs text-muted-foreground">Periode berakhir</div>
            <div className="text-sm text-foreground">{new Date(sub.currentPeriodEnd).toLocaleDateString("id-ID")}</div>
          </div>
        )}
        <div>
          <div className="mb-1 text-xs text-muted-foreground">Owner</div>
          <div className="text-sm text-foreground">{owner?.name} · {owner?.email}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-bold transition-colors",
              tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-4 w-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="cg-card rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-bold text-foreground">Anggota tim</h3>
            <div className="space-y-2">
              {workspace.memberships.map((m) => (
                <div key={m.user.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-bold text-foreground">{m.user.name}</div>
                    <div className="text-xs text-muted-foreground">{m.user.email}</div>
                  </div>
                  <span className="rounded-full border border-border px-3 py-1 text-xs text-foreground">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="cg-card rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-bold text-foreground">Scraping terbaru</h3>
            <div className="space-y-2">
              {scraperJobs.slice(0, 5).map((j) => (
                <div key={j.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-foreground">{j.name ?? j.keyword}</div>
                    <div className="text-xs text-muted-foreground">{j.totalFound} lead</div>
                  </div>
                  <span className={cn("ml-2 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold", STATUS_BADGE[j.status] ?? STATUS_BADGE.STOPPED)}>{j.status}</span>
                </div>
              ))}
              {scraperJobs.length === 0 && <div className="text-sm text-muted-foreground">Belum ada scraping.</div>}
            </div>
          </div>
        </div>
      )}

      {tab === "scraper" && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted">
              <tr className="text-left text-xs uppercase text-muted-foreground">
                <th className="p-3">Job</th>
                <th className="p-3 text-center">Lead</th>
                <th className="p-3">Status</th>
                <th className="p-3">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {scraperJobs.map((j) => (
                <tr key={j.id} className="border-b border-border last:border-0 hover:bg-muted">
                  <td className="p-3">
                    <div className="font-bold text-foreground">{j.name ?? j.keyword}</div>
                    <div className="text-xs text-muted-foreground">{j.keyword}</div>
                  </td>
                  <td className="p-3 text-center font-bold text-foreground">{j.totalFound}</td>
                  <td className="p-3"><span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", STATUS_BADGE[j.status] ?? STATUS_BADGE.STOPPED)}>{j.status}</span></td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(j.createdAt).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
              {scraperJobs.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Belum ada scraping.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "blasts" && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted">
              <tr className="text-left text-xs uppercase text-muted-foreground">
                <th className="p-3">Blast</th>
                <th className="p-3 text-center">Penerima</th>
                <th className="p-3">Status</th>
                <th className="p-3">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {blasts.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted">
                  <td className="p-3 font-bold text-foreground">{b.name ?? "(tanpa nama)"}</td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 text-foreground"><Phone className="h-3.5 w-3.5" />{b.totalRecipients}</span>
                  </td>
                  <td className="p-3"><span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", STATUS_BADGE[b.status] ?? STATUS_BADGE.DRAFT)}>{b.status}</span></td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}
              {blasts.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Belum ada blast.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "credits" && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted">
              <tr className="text-left text-xs uppercase text-muted-foreground">
                <th className="p-3">Jenis</th>
                <th className="p-3 text-right">Saldo Akhir</th>
                <th className="p-3 text-right">Jumlah</th>
                <th className="p-3">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {creditLedger.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted">
                  <td className="p-3">
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs text-foreground">{l.reason}</span>
                  </td>
                  <td className="p-3 text-right tabular-nums text-muted-foreground">{l.balanceAfter.toLocaleString("id-ID")}</td>
                  <td className={cn("p-3 text-right font-bold tabular-nums", l.amount >= 0 ? "text-success" : "text-destructive")}>
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

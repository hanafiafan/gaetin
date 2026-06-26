"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarClock, Gauge, Loader2, Pause, Play, RotateCcw, Send, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Account { id: string; label: string; status: string }
interface Template { id: string; name: string; body: string }
interface Campaign {
  id: string;
  name: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  scheduledAt: string | null;
}
interface MessagingQuota {
  planName: string;
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
}

function progress(campaign: Campaign) {
  if (campaign.totalRecipients <= 0) return 0;
  return Math.round(((campaign.sentCount + campaign.failedCount) / campaign.totalRecipients) * 100);
}

function statusVariant(status: string) {
  if (status === "ACTIVE") return "default";
  if (status === "FAILED") return "destructive";
  return "outline";
}

export default function CampaignsClient() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [quota, setQuota] = useState<MessagingQuota | null>(null);
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [message, setMessage] = useState("");
  const [scope, setScope] = useState<"activeWa" | "all">("activeWa");
  const [label, setLabel] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadAll() {
    const [ra, rt, rc, rq] = await Promise.all([
      fetch("/api/whatsapp/accounts"),
      fetch("/api/templates"),
      fetch("/api/campaigns"),
      fetch("/api/messaging/quota"),
    ]);
    const [ja, jt, jc, jq] = await Promise.all([ra.json(), rt.json(), rc.json(), rq.json()]);
    if (ja.success) {
      setAccounts(ja.data);
      const connected = ja.data.find((account: Account) => account.status === "connected");
      if (connected) setAccountId(connected.id);
    }
    if (jt.success) setTemplates(jt.data);
    if (jc.success) setCampaigns(jc.data);
    if (jq.success) setQuota(jq.data);
  }

  async function loadCampaigns() {
    const res = await fetch("/api/campaigns");
    const json = await res.json();
    if (json.success) setCampaigns(json.data);
    const quotaRes = await fetch("/api/messaging/quota");
    const quotaJson = await quotaRes.json();
    if (quotaJson.success) setQuota(quotaJson.data);
  }

  useEffect(() => {
    loadAll();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    const anyActive = campaigns.some((campaign) => campaign.status === "ACTIVE");
    if (anyActive && !pollRef.current) pollRef.current = setInterval(loadCampaigns, 2500);
    else if (!anyActive && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [campaigns]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    const payload: Record<string, unknown> = { name, accountId, messageTemplate: message, scope };
    if (label) payload.label = label;
    if (scheduledAt) payload.scheduledAt = new Date(scheduledAt).toISOString();
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(json?.error?.message ?? "Gagal membuat kampanye");
      return;
    }
    setName("");
    setMessage("");
    setLabel("");
    setScheduledAt("");
    loadCampaigns();
  }

  async function act(id: string, action: "execute" | "pause" | "resume") {
    setError(null);
    const res = await fetch(`/api/campaigns/${id}/${action}`, { method: "POST" });
    if (!res.ok) {
      const json = await res.json();
      setError(json?.error?.message ?? "Aksi kampanye gagal");
    }
    loadCampaigns();
  }

  const connected = accounts.filter((account) => account.status === "connected");

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div>
            <h2 className="text-lg font-semibold">Rancang kampanye</h2>
            <p className="mt-1 text-sm text-muted-foreground">Gunakan template, targetkan segmen, dan jadwalkan pengiriman.</p>
          </div>
          {error && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
          {quota && (
            <div className="rounded-xl border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Gauge className="h-4 w-4 text-primary" />
                  Kuota kirim harian
                </div>
                <span className="text-xs text-muted-foreground">{quota.planName}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, Math.round((quota.used / quota.limit) * 100))}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {quota.remaining.toLocaleString("id-ID")} sisa dari {quota.limit.toLocaleString("id-ID")} pesan hari ini.
              </p>
            </div>
          )}
          <form onSubmit={create} className="space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kampanye" className="h-11" />
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Pilih nomor WhatsApp...</option>
              {connected.map((account) => (<option key={account.id} value={account.id}>{account.label}</option>))}
            </select>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <select value={scope} onChange={(e) => setScope(e.target.value as "activeWa" | "all")} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
                <option value="activeWa">Hanya aktif WA</option>
                <option value="all">Semua kontak</option>
              </select>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Filter label (opsional)" className="h-11" />
            </div>
            {templates.length > 0 && (
              <select
                onChange={(e) => {
                  const template = templates.find((item) => item.id === e.target.value);
                  if (template) setMessage(template.body);
                }}
                defaultValue=""
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Pakai template... (opsional)</option>
                {templates.map((template) => (<option key={template.id} value={template.id}>{template.name}</option>))}
              </select>
            )}
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Halo {{nama}}, kami ingin mengabarkan..." className="w-full rounded-xl border border-input bg-background p-3 text-sm" />
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <CalendarClock className="h-4 w-4 text-primary" />
                Jadwalkan
              </label>
              <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm" />
            </div>
            <div className="rounded-xl border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
              <Wand2 className="mr-1 inline h-3.5 w-3.5" />
              Kosongkan jadwal untuk membuat draft yang bisa dijalankan manual.
            </div>
            <Button type="submit" className="h-11 w-full rounded-full" disabled={creating || !accountId || !name.trim() || !message.trim()}>
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {creating ? "Membuat..." : "Buat kampanye"}
            </Button>
            {connected.length === 0 && <p className="text-xs text-destructive">Hubungkan nomor WhatsApp dulu di Pengaturan.</p>}
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div>
            <h2 className="text-lg font-semibold">Daftar kampanye</h2>
            <p className="text-sm text-muted-foreground">{campaigns.length} kampanye dibuat</p>
          </div>
          <div className="space-y-3">
            {campaigns.map((campaign) => {
              const pct = progress(campaign);
              return (
                <div key={campaign.id} className="rounded-2xl border bg-background p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold">{campaign.name}</h3>
                        <Badge variant={statusVariant(campaign.status)}>{campaign.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {campaign.totalRecipients} penerima · {campaign.sentCount} terkirim · {campaign.failedCount} gagal
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {(campaign.status === "DRAFT" || campaign.status === "SCHEDULED") && (
                        <Button size="sm" onClick={() => act(campaign.id, "execute")} disabled={quota?.remaining === 0}><Play className="mr-2 h-4 w-4" />Jalankan</Button>
                      )}
                      {campaign.status === "ACTIVE" && (
                        <Button size="sm" variant="outline" onClick={() => act(campaign.id, "pause")}><Pause className="mr-2 h-4 w-4" />Jeda</Button>
                      )}
                      {campaign.status === "PAUSED" && (
                        <Button size="sm" onClick={() => act(campaign.id, "resume")}><RotateCcw className="mr-2 h-4 w-4" />Lanjutkan</Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {campaigns.length === 0 && (
              <div className="rounded-2xl border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
                Belum ada kampanye. Buat campaign pertama dari panel di kiri.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

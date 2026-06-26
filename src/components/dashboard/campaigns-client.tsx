"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarClock, Gauge, Loader2, Pause, Play, RotateCcw, Send, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

function campaignPct(c: Campaign) {
  if (c.totalRecipients <= 0) return 0;
  return Math.round(((c.sentCount + c.failedCount) / c.totalRecipients) * 100);
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-primary/15 text-primary",
  DONE: "bg-emerald-500/15 text-emerald-400",
  FAILED: "bg-red-500/15 text-red-400",
  PAUSED: "bg-amber-500/15 text-amber-400",
  DRAFT: "bg-slate-500/15 text-slate-400",
  SCHEDULED: "bg-blue-500/15 text-blue-400",
};

const SELECT_CLASS = "h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white focus:outline-none";

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
      fetch("/api/whatsapp/accounts"), fetch("/api/templates"), fetch("/api/campaigns"), fetch("/api/messaging/quota"),
    ]);
    const [ja, jt, jc, jq] = await Promise.all([ra.json(), rt.json(), rc.json(), rq.json()]);
    if (ja.success) {
      setAccounts(ja.data);
      const c = ja.data.find((a: Account) => a.status === "connected");
      if (c) setAccountId(c.id);
    }
    if (jt.success) setTemplates(jt.data);
    if (jc.success) setCampaigns(jc.data);
    if (jq.success) setQuota(jq.data);
  }

  async function loadCampaigns() {
    const res = await fetch("/api/campaigns");
    const json = await res.json();
    if (json.success) setCampaigns(json.data);
    const qr = await fetch("/api/messaging/quota");
    const qj = await qr.json();
    if (qj.success) setQuota(qj.data);
  }

  useEffect(() => {
    loadAll();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    const anyActive = campaigns.some((c) => c.status === "ACTIVE");
    if (anyActive && !pollRef.current) pollRef.current = setInterval(loadCampaigns, 2500);
    else if (!anyActive && pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
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
    if (!res.ok) { setError(json?.error?.message ?? "Gagal membuat kampanye"); return; }
    setName(""); setMessage(""); setLabel(""); setScheduledAt("");
    loadCampaigns();
  }

  async function act(id: string, action: "execute" | "pause" | "resume") {
    setError(null);
    const res = await fetch(`/api/campaigns/${id}/${action}`, { method: "POST" });
    if (!res.ok) { const j = await res.json(); setError(j?.error?.message ?? "Aksi kampanye gagal"); }
    loadCampaigns();
  }

  const connected = accounts.filter((a) => a.status === "connected");

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="cg-card rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="font-black text-white">Rancang kampanye</h2>
          <p className="mt-1 text-sm text-slate-400">Gunakan template, targetkan segmen, dan jadwalkan pengiriman.</p>
        </div>
        {error && <div className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
        {quota && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Gauge className="h-4 w-4 text-primary" />
                Kuota kirim harian
              </div>
              <span className="text-xs text-slate-400">{quota.planName}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/[0.08]">
              <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, Math.round((quota.used / quota.limit) * 100))}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {quota.remaining.toLocaleString("id-ID")} sisa dari {quota.limit.toLocaleString("id-ID")} pesan hari ini.
            </p>
          </div>
        )}
        <form onSubmit={create} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kampanye"
            className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none"
          />
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={SELECT_CLASS}>
            <option value="">Pilih nomor WhatsApp...</option>
            {connected.map((a) => (<option key={a.id} value={a.id}>{a.label}</option>))}
          </select>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <select value={scope} onChange={(e) => setScope(e.target.value as "activeWa" | "all")} className={SELECT_CLASS}>
              <option value="activeWa">Hanya aktif WA</option>
              <option value="all">Semua kontak</option>
            </select>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Filter label (opsional)"
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none"
            />
          </div>
          {templates.length > 0 && (
            <select
              onChange={(e) => {
                const t = templates.find((x) => x.id === e.target.value);
                if (t) setMessage(t.body);
              }}
              defaultValue=""
              className={SELECT_CLASS}
            >
              <option value="">Pakai template... (opsional)</option>
              {templates.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
          )}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="Halo {{nama}}, kami ingin mengabarkan..."
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none"
          />
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <CalendarClock className="h-4 w-4 text-primary" />
              Jadwalkan (opsional)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white focus:outline-none"
            />
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-xs leading-5 text-slate-400">
            <Wand2 className="mr-1 inline h-3.5 w-3.5 text-primary" />
            Kosongkan jadwal untuk membuat draft yang bisa dijalankan manual.
          </div>
          <button
            type="submit"
            disabled={creating || !accountId || !name.trim() || !message.trim()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/15 text-sm font-bold text-primary transition hover:bg-primary/25 disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {creating ? "Membuat..." : "Buat kampanye"}
          </button>
          {connected.length === 0 && <p className="text-xs text-destructive">Hubungkan nomor WhatsApp dulu di Pengaturan.</p>}
        </form>
      </div>

      <div className="cg-card rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="font-black text-white">Daftar kampanye</h2>
          <p className="text-sm text-slate-400">{campaigns.length} kampanye dibuat</p>
        </div>
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const pct = campaignPct(campaign);
            const sc = STATUS_COLOR[campaign.status] ?? "bg-slate-500/15 text-slate-400";
            return (
              <div key={campaign.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-bold text-white">{campaign.name}</h3>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-bold", sc)}>{campaign.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {campaign.totalRecipients} penerima · {campaign.sentCount} terkirim · {campaign.failedCount} gagal
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(campaign.status === "DRAFT" || campaign.status === "SCHEDULED") && (
                      <button
                        onClick={() => act(campaign.id, "execute")}
                        disabled={quota?.remaining === 0}
                        className="flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-3 text-xs font-bold text-primary transition hover:bg-primary/25 disabled:opacity-50"
                      >
                        <Play className="h-3 w-3" /> Jalankan
                      </button>
                    )}
                    {campaign.status === "ACTIVE" && (
                      <button
                        onClick={() => act(campaign.id, "pause")}
                        className="flex h-8 items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 text-xs font-bold text-amber-400 transition hover:bg-amber-500/25"
                      >
                        <Pause className="h-3 w-3" /> Jeda
                      </button>
                    )}
                    {campaign.status === "PAUSED" && (
                      <button
                        onClick={() => act(campaign.id, "resume")}
                        className="flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-3 text-xs font-bold text-primary transition hover:bg-primary/25"
                      >
                        <RotateCcw className="h-3 w-3" /> Lanjutkan
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-slate-500">
                    <span>Progress</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06]">
                    <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
          {campaigns.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/[0.08] p-10 text-center text-sm text-slate-500">
              Belum ada kampanye. Buat campaign pertama dari panel di kiri.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

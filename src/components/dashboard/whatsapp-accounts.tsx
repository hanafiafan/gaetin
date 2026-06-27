"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  label: string;
  phoneNumber?: string | null;
  status: "connected" | "connecting" | "disconnected" | string;
  dailyLimit?: number;
  sentToday?: number;
}

const STATUS_LABEL: Record<string, string> = {
  connected: "Terhubung",
  connecting: "Menghubungkan",
  disconnected: "Terputus",
};

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "connected"
      ? "bg-emerald-500/15 text-emerald-400"
      : status === "connecting"
        ? "bg-amber-500/15 text-amber-400"
        : "bg-slate-500/15 text-slate-400";
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", color)}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export default function WhatsAppAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState<{ id: string; img: string | null; status: string } | null>(null);
  const esRef = useRef<EventSource | null>(null);

  async function load() {
    const r = await fetch("/api/whatsapp/accounts");
    const j = await r.json();
    if (j.success) setAccounts(j.data);
  }

  useEffect(() => {
    load();
    return () => esRef.current?.close();
  }, []);

  function stopStream() {
    esRef.current?.close();
    esRef.current = null;
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setLoading(true);
    await fetch("/api/whatsapp/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    setLabel("");
    setLoading(false);
    load();
  }

  function connect(id: string) {
    stopStream();
    setQr({ id, img: null, status: "connecting" });

    const es = new EventSource(`/api/whatsapp/accounts/${id}/events`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as { type: string; qr?: string; status?: string };
        if (data.type === "qr" && data.qr) {
          setQr({ id, img: data.qr, status: "connecting" });
        } else if (data.type === "status") {
          if (data.status === "connected" || data.status === "disconnected") {
            stopStream();
            setQr(null);
            load();
          }
        }
      } catch { /* ignore malformed */ }
    };

    es.onerror = () => stopStream();
  }

  async function disconnect(id: string) {
    stopStream();
    if (qr?.id === id) setQr(null);
    await fetch(`/api/whatsapp/accounts/${id}/disconnect`, { method: "POST" });
    load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label nomor (mis. CS 1, Sales)"
          className="h-10 max-w-xs flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-10 items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-4 text-sm font-bold text-primary transition hover:bg-primary/25 disabled:opacity-50"
        >
          Tambah nomor
        </button>
      </form>

      {accounts.length === 0 && (
        <p className="text-sm text-slate-500">Belum ada nomor WhatsApp. Tambahkan satu untuk mulai.</p>
      )}

      <div className="space-y-3">
        {accounts.map((a) => (
          <div key={a.id} className="cg-card rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-white">{a.label}</p>
                <p className="text-sm text-slate-400">
                  {a.phoneNumber ? `+${a.phoneNumber}` : "Belum terhubung"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={a.status} />
                {a.status === "connected" ? (
                  <button
                    onClick={() => disconnect(a.id)}
                    className="h-8 rounded-full border border-white/[0.08] px-3 text-xs font-bold text-slate-300 transition hover:border-red-500/30 hover:text-red-400"
                  >
                    Putuskan
                  </button>
                ) : (
                  <button
                    onClick={() => connect(a.id)}
                    disabled={qr?.id === a.id}
                    className="h-8 rounded-full border border-primary/30 bg-primary/15 px-3 text-xs font-bold text-primary transition hover:bg-primary/25 disabled:opacity-60"
                  >
                    Hubungkan
                  </button>
                )}
              </div>
            </div>

            {qr?.id === a.id && (
              <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
                {qr.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr.img} alt="QR WhatsApp" width={220} height={220} className="rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    <p className="text-sm text-slate-400">Menyiapkan QR code...</p>
                  </div>
                )}
                <p className="text-center text-xs text-slate-500">
                  Buka WhatsApp → Perangkat tertaut → Tautkan perangkat, lalu pindai QR ini.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

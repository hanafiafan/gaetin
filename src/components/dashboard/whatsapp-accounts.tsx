"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
      ? "bg-green-500/10 text-green-600"
      : status === "connecting"
        ? "bg-amber-500/10 text-amber-600"
        : "bg-muted text-muted-foreground";
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", color)}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export default function WhatsAppAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [qr, setQr] = useState<{ id: string; img: string | null; status: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    const r = await fetch("/api/whatsapp/accounts");
    const j = await r.json();
    if (j.success) setAccounts(j.data);
  }

  useEffect(() => {
    load();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function stopPoll() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
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

  async function connect(id: string) {
    setQr({ id, img: null, status: "connecting" });
    await fetch(`/api/whatsapp/accounts/${id}/connect`, { method: "POST" });
    stopPoll();
    pollRef.current = setInterval(async () => {
      const r = await fetch(`/api/whatsapp/accounts/${id}/qr`);
      const j = await r.json();
      if (j.success) {
        setQr({ id, img: j.data.qr, status: j.data.status });
        if (j.data.status === "connected") {
          stopPoll();
          setQr(null);
          load();
        }
      }
    }, 2500);
  }

  async function disconnect(id: string) {
    await fetch(`/api/whatsapp/accounts/${id}/disconnect`, { method: "POST" });
    if (qr?.id === id) {
      stopPoll();
      setQr(null);
    }
    load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="flex gap-2">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label nomor (mis. CS 1, Sales)"
          className="max-w-xs"
        />
        <Button type="submit" disabled={loading}>
          Tambah nomor
        </Button>
      </form>

      {accounts.length === 0 && (
        <p className="text-sm text-muted-foreground">Belum ada nomor WhatsApp. Tambahkan satu untuk mulai.</p>
      )}

      <div className="space-y-3">
        {accounts.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{a.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {a.phoneNumber ? `+${a.phoneNumber}` : "Belum terhubung"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={a.status} />
                  {a.status === "connected" ? (
                    <Button variant="outline" size="sm" onClick={() => disconnect(a.id)}>
                      Putuskan
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => connect(a.id)}>
                      Hubungkan
                    </Button>
                  )}
                </div>
              </div>

              {qr?.id === a.id && (
                <div className="mt-4 flex flex-col items-center gap-2 rounded-md border bg-muted/30 p-4">
                  {qr.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qr.img} alt="QR WhatsApp" width={220} height={220} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Menyiapkan QR code...</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Buka WhatsApp - Perangkat tertaut - Tautkan perangkat, lalu pindai QR ini.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

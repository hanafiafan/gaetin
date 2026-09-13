"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/dashboard/status-badge";
import { PROFIL_UMUR, UMUR_NOMOR, type UmurNomor } from "@/lib/messaging/account-age";

interface Account {
  id: string;
  label: string;
  phoneNumber?: string | null;
  status: "connected" | "connecting" | "disconnected" | string;
  dailyLimit?: number;
  sentToday?: number;
  warmupDay?: number;
  todayLimit?: number;
  warmingUp?: boolean;
  accountAge?: UmurNomor;
  ageLabel?: string;
}

export default function WhatsAppAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [label, setLabel] = useState("");
  const [umur, setUmur] = useState<UmurNomor>("BARU");
  const [loading, setLoading] = useState(false);
  const [sedangDiatur, setSedangDiatur] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);
  const [qr, setQr] = useState<{ id: string; img: string | null; status: string; error?: string } | null>(null);
  const esRef = useRef<EventSource | null>(null);

  async function load() {
    const r = await fetch("/api/whatsapp/accounts");
    const j = await r.json();
    if (j.success) {
      setAccounts(j.data);
      // Kalau akun yang sedang di-connect sudah CONNECTED, bersihkan QR state
      setQr((prev) => {
        if (!prev) return null;
        const updated = (j.data as Account[]).find((a) => a.id === prev.id);
        return updated?.status === "connected" ? null : prev;
      });
    }
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
      body: JSON.stringify({ label, accountAge: umur }),
    });
    setLabel("");
    setUmur("BARU");
    setLoading(false);
    load();
  }

  async function simpanSetelan(id: string, data: { label?: string; dailyLimit?: number; accountAge?: UmurNomor }) {
    setMenyimpan(true);
    const r = await fetch(`/api/whatsapp/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setMenyimpan(false);
    if (!r.ok) {
      const j = await r.json().catch(() => null);
      alert(j?.error?.message ?? "Setelan gagal disimpan");
      return;
    }
    setSedangDiatur(null);
    load();
  }

  function connect(id: string) {
    stopStream();
    setQr({ id, img: null, status: "connecting" });

    const es = new EventSource(`/api/whatsapp/accounts/${id}/events`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as { type: string; qr?: string; status?: string; message?: string };
        if (data.type === "qr" && data.qr) {
          setQr({ id, img: data.qr, status: "connecting" });
        } else if (data.type === "status") {
          if (data.status === "connected") {
            stopStream();
            setQr(null);
            load();
          } else if (data.status === "disconnected") {
            stopStream();
            setQr({ id, img: null, status: "error", error: "Koneksi gagal. Coba lagi." });
          }
        } else if (data.type === "error") {
          stopStream();
          // Cek dulu apakah sebenarnya sudah connected (auth berhasil tapi SSE keburu timeout)
          load().then(() => {
            setQr((prev) => {
              if (!prev) return null;
              return { ...prev, status: "error", error: data.message ?? "Gagal mendapatkan QR." };
            });
          });
        }
      } catch { /* ignore malformed */ }
    };

    // Jika SSE terputus, reload akun dulu — mungkin koneksi sudah berhasil
    es.onerror = () => {
      stopStream();
      load().then(() => {
        setQr((prev) => prev?.status === "connecting" ? { ...prev, status: "error", error: "Koneksi terputus. Coba lagi." } : null);
      });
    };
  }

  async function disconnect(id: string) {
    stopStream();
    if (qr?.id === id) setQr(null);
    await fetch(`/api/whatsapp/accounts/${id}/disconnect`, { method: "POST" });
    load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            aria-label="Beri nama nomor ini, misalnya Nomor CS" placeholder="Beri nama nomor ini, misalnya Nomor CS"
            className="h-10 min-w-[220px] flex-1 rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
          />
          <select
            value={umur}
            onChange={(e) => setUmur(e.target.value as UmurNomor)}
            aria-label="Nomor ini sudah aktif berapa lama"
            className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:border-primary/40 focus:outline-none"
          >
            {UMUR_NOMOR.map((u) => (
              <option key={u} value={u}>Sudah aktif: {PROFIL_UMUR[u].label}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            Tambah nomor
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{PROFIL_UMUR[umur].keterangan}</p>
      </form>

      {accounts.length === 0 && (
        <p className="text-sm text-muted-foreground">Belum ada nomor WhatsApp. Tambahkan satu untuk mulai.</p>
      )}

      <div className="space-y-3">
        {accounts.map((a) => (
          <div key={a.id} className="cg-card cg-sheet rounded-xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-foreground">{a.label}</p>
                <p className="text-sm text-muted-foreground">
                  {a.phoneNumber ? `+${a.phoneNumber}` : "Belum terhubung"}
                </p>
                {a.todayLimit !== undefined && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Terkirim hari ini {a.sentToday ?? 0} dari {a.todayLimit}
                    {a.warmingUp && (
                      <span className="ml-1.5 rounded bg-warning/15 px-1.5 py-0.5 font-semibold text-warning">
                        Masa pemanasan · hari {Math.max(1, a.warmupDay ?? 0)}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={a.status} />
                {a.status === "connected" ? (
                  <button
                    onClick={() => disconnect(a.id)}
                    className="h-10 border border-border px-3 text-xs font-bold text-foreground/80 transition hover:border-destructive/30 hover:text-destructive"
                  >
                    Putuskan
                  </button>
                ) : (
                  <button
                    onClick={() => connect(a.id)}
                    disabled={qr?.id === a.id}
                    className="h-10 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                  >
                    Hubungkan
                  </button>
                )}
                <button
                  onClick={() => setSedangDiatur(sedangDiatur === a.id ? null : a.id)}
                  className="h-10 rounded-lg border border-border px-3 text-xs font-bold text-foreground/80 transition hover:border-foreground/30 hover:text-foreground"
                >
                  {sedangDiatur === a.id ? "Tutup" : "Atur"}
                </button>
              </div>
            </div>

            {sedangDiatur === a.id && <SetelanNomor akun={a} menyimpan={menyimpan} onSimpan={simpanSetelan} />}

            {qr?.id === a.id && (
              <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4">
                {qr.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr.img} alt="QR WhatsApp" width={220} height={220} className="rounded-lg" />
                ) : qr.status === "error" ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <p className="text-sm text-destructive">{qr.error ?? "Gagal mendapatkan QR."}</p>
                    <button
                      onClick={() => connect(a.id)}
                      className="bg-primary/20 px-4 py-1.5 text-xs font-bold text-foreground hover:bg-primary/30"
                    >
                      Coba lagi
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    <p className="text-sm text-muted-foreground">Menyiapkan QR code...</p>
                  </div>
                )}
                <p className="text-center text-xs text-muted-foreground">
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

/**
 * Setelan satu nomor: nama, umur, dan batas kirim hariannya.
 *
 * Umur nomor tidak bisa diketahui sistem — yang dilihatnya cuma kapan nomor
 * itu disambungkan ke sini. Pemiliknya yang tahu, dan jawabannya menentukan
 * dari anak tangga pemanasan mana nomor itu mulai.
 */
function SetelanNomor({
  akun,
  menyimpan,
  onSimpan,
}: {
  akun: Account;
  menyimpan: boolean;
  onSimpan: (id: string, data: { label?: string; dailyLimit?: number; accountAge?: UmurNomor }) => void;
}) {
  const [nama, setNama] = useState(akun.label);
  const [umur, setUmur] = useState<UmurNomor>(akun.accountAge ?? "BARU");
  const [batas, setBatas] = useState(String(akun.dailyLimit ?? 100));

  const profil = PROFIL_UMUR[umur];
  const umurBerubah = umur !== (akun.accountAge ?? "BARU");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSimpan(akun.id, { label: nama.trim() || akun.label, accountAge: umur, dailyLimit: Number(batas) || 1 });
      }}
      className="mt-4 space-y-3 rounded-xl border border-border bg-muted/40 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor={`nama-${akun.id}`}>
            Nama nomor
          </label>
          <input
            id={`nama-${akun.id}`}
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:border-primary/40 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor={`umur-${akun.id}`}>
            Nomor ini sudah aktif berapa lama?
          </label>
          <select
            id={`umur-${akun.id}`}
            value={umur}
            onChange={(e) => setUmur(e.target.value as UmurNomor)}
            className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:border-primary/40 focus:outline-none"
          >
            {UMUR_NOMOR.map((u) => (
              <option key={u} value={u}>{PROFIL_UMUR[u].label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground" htmlFor={`batas-${akun.id}`}>
            Batas kirim per hari
          </label>
          <input
            id={`batas-${akun.id}`}
            inputMode="numeric"
            value={batas}
            onChange={(e) => setBatas(e.target.value.replace(/[^\d]/g, ""))}
            className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:border-primary/40 focus:outline-none"
          />
          <p className="text-xs text-muted-foreground">
            Disarankan {profil.batasDisarankan} untuk nomor seumur ini.
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{profil.keterangan}</p>

      {/* Mengubah umur menyetel ulang hitungan pemanasan. Itu wajar, tapi harus
          disebutkan dulu — bukan ditemukan sendiri saat kirimannya tiba-tiba
          dibatasi 20 pesan sehari. */}
      {umurBerubah && (
        <p className="text-xs text-warning">
          Mengubah umur nomor akan menghitung ulang masa pemanasannya dari awal untuk umur yang baru dipilih.
        </p>
      )}

      <button
        type="submit"
        disabled={menyimpan}
        className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-foreground hover:text-background disabled:opacity-50"
      >
        Simpan setelan
      </button>
    </form>
  );
}

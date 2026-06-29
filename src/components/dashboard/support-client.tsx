"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Clock, HelpCircle, LifeBuoy, Send, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketItem {
  id: string;
  ticketNo: string;
  subject: string;
  status: string;
  createdAt: string;
}

const FAQ = [
  {
    q: "Apa itu kredit dan kapan terpotong?",
    a: "Kredit terpotong saat menyimpan lead jadi kontak dan saat validasi nomor. Tiap paket memberi jatah kredit bulanan; bisa top-up kapan saja di menu Tagihan.",
  },
  {
    q: "Kenapa blast saya gagal terkirim?",
    a: "Pastikan nomor WhatsApp terhubung (Pengaturan), penerima bukan Do-Not-Contact, dan belum melewati batas kirim harian nomor.",
  },
  {
    q: "Bagaimana menghubungkan WhatsApp?",
    a: "Buka Pengaturan > Koneksi WhatsApp, tambah nomor, lalu pindai QR seperti WhatsApp Web.",
  },
  {
    q: "Bagaimana cara upgrade paket?",
    a: "Buka menu Tagihan, pilih paket yang diinginkan, dan selesaikan pembayaran via Xendit (VA/e-wallet/QRIS).",
  },
  {
    q: "Apakah nomor WhatsApp saya aman?",
    a: "Koneksi dibuat via Baileys (library resmi) dengan sesi per nomor. Gaetin tidak menyimpan percakapan pribadi Anda di luar database workspace.",
  },
  {
    q: "Berapa lama kredit kadaluwarsa?",
    a: "Kredit tidak kadaluwarsa. Kredit bulanan dari paket akan ter-reset setiap siklus billing, tapi saldo yang tersisa dari top-up manual tidak hangus.",
  },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Terbuka", color: "bg-primary/15 text-primary" },
  IN_PROGRESS: { label: "Diproses", color: "bg-amber-500/15 text-amber-400" },
  RESOLVED: { label: "Selesai", color: "bg-emerald-500/15 text-emerald-400" },
  CLOSED: { label: "Ditutup", color: "bg-slate-500/15 text-muted-foreground" },
};

export default function SupportClient() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  async function load() {
    const r = await fetch("/api/support/tickets");
    const j = await r.json();
    if (j.success) setTickets(j.data);
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
    const j = await r.json();
    setLoading(false);
    if (r.ok) {
      setSent(j.data.ticketNo);
      setSubject("");
      setMessage("");
      load();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      {/* FAQ */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          <h2 className="font-black text-foreground">Pertanyaan umum</h2>
        </div>
        <div className="space-y-2">
          {FAQ.map((f, i) => (
            <div
              key={f.q}
              className={cn("rounded-2xl border transition", openFaq === i ? "border-primary/25 bg-primary/[0.06]" : "border-border bg-card hover:border-border")}
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
              >
                <span className="text-sm font-bold text-foreground">{f.q}</span>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", openFaq === i && "rotate-180 text-primary")}
                />
              </button>
              {openFaq === i && (
                <div className="border-t border-border px-4 pb-4 pt-3 text-sm leading-7 text-foreground/80">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ticket form + list */}
      <div className="space-y-5">
        <div className="cg-card rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <LifeBuoy className="h-4 w-4 text-primary" />
            <h2 className="font-black text-foreground">Kirim tiket bantuan</h2>
          </div>

          {sent && (
            <div className="mb-4 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
              Tiket <span className="font-black">{sent}</span> terkirim. Tim kami merespons maks 1×24 jam kerja.
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Subjek</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ringkasan kendala Anda..."
                required
                className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Detail</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Jelaskan kendala Anda secara detail..."
                required
                className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-0 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !subject.trim() || !message.trim()}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-border bg-muted text-sm font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/15 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {loading ? "Mengirim..." : "Kirim tiket"}
            </button>
          </form>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            <h2 className="font-black text-foreground">Tiket saya</h2>
            {tickets.length > 0 && (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-black text-primary">{tickets.length}</span>
            )}
          </div>
          {tickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Belum ada tiket. Kirim tiket jika perlu bantuan.
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => {
                const s = STATUS_MAP[t.status] ?? { label: t.status, color: "bg-slate-500/15 text-muted-foreground" };
                return (
                  <div key={t.id} className="cg-card flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">{t.subject}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {t.ticketNo} · {new Date(t.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold", s.color)}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

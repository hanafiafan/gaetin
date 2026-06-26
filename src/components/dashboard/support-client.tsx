"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Ticket {
  id: string;
  ticketNo: string;
  subject: string;
  status: string;
  createdAt: string;
}

const FAQ = [
  { q: "Apa itu kredit dan kapan terpotong?", a: "Kredit terpotong saat menyimpan lead jadi kontak dan saat validasi nomor. Tiap paket memberi jatah kredit bulanan; bisa top-up kapan saja di menu Langganan." },
  { q: "Kenapa blast saya gagal terkirim?", a: "Pastikan nomor WhatsApp terhubung (Pengaturan), penerima bukan Do-Not-Contact, dan belum melewati batas kirim harian nomor." },
  { q: "Bagaimana menghubungkan WhatsApp?", a: "Buka Pengaturan > Koneksi WhatsApp, tambah nomor, lalu pindai QR seperti WhatsApp Web." },
  { q: "Bagaimana cara upgrade paket?", a: "Buka menu Langganan, pilih paket, dan selesaikan pembayaran via Xendit (VA/e-wallet/QRIS)." },
];

export default function SupportClient() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/support/tickets");
    const j = await r.json();
    if (j.success) setTickets(j.data);
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
    const j = await r.json();
    if (r.ok) {
      setSent(j.data.ticketNo);
      setSubject("");
      setMessage("");
      load();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h2 className="mb-3 font-medium">FAQ</h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-lg border bg-card p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <form onSubmit={submit} className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="font-medium">Kirim tiket bantuan</h2>
          {sent && <div className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600">Tiket terkirim: {sent}. Kami balas maks 1×24 jam kerja.</div>}
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subjek" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Jelaskan kendalamu..." className="w-full rounded-md border border-input bg-background p-3 text-sm" />
          <Button type="submit" disabled={!subject.trim() || !message.trim()}>Kirim tiket</Button>
        </form>

        <div>
          <h2 className="mb-2 font-medium">Tiket saya</h2>
          <div className="space-y-2">
            {tickets.length === 0 && <p className="text-sm text-muted-foreground">Belum ada tiket.</p>}
            {tickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm">
                <div><span className="font-medium">{t.subject}</span><div className="text-xs text-muted-foreground">{t.ticketNo}</div></div>
                <span className="text-xs text-muted-foreground">{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

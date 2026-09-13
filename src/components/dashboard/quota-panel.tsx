"use client";

import { Gauge } from "lucide-react";

/**
 * Panel "Kuota kirim harian".
 *
 * Sebelumnya panel ini ditulis dua kali — di Kirim Pesan dan di Pesan Susulan —
 * dan keduanya sempat berbeda isi: yang satu menjelaskan kenapa angkanya
 * terbatas, yang satu hanya menulis "0 sisa dari 0" tanpa sebab. Dua salinan
 * dari hal yang sama selalu berakhir begitu.
 */

export interface MessagingQuota {
  planName: string;
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
  connectedNumbers: number;
  numberCapacity: number;
  effectiveLimit: number;
  effectiveRemaining: number;
  bottleneck: "numbers" | "plan";
}

const angka = (n: number) => n.toLocaleString("id-ID");

export default function QuotaPanel({ quota }: { quota: MessagingQuota }) {
  const persen = Math.min(100, Math.round((quota.used / Math.max(1, quota.effectiveLimit)) * 100));

  return (
    <div className="rounded-xl border border-border bg-whatsapp/5 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Gauge className="h-4 w-4 text-whatsapp" />
          Kuota kirim harian
        </div>
        <span className="text-xs text-muted-foreground">{quota.planName}</span>
      </div>

      <div className="mt-2 h-1.5 rounded-full bg-muted">
        <div className="h-1.5 rounded-full bg-whatsapp" style={{ width: `${persen}%` }} />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {angka(quota.effectiveRemaining)} sisa dari {angka(quota.effectiveLimit)} pesan hari ini.
      </p>

      {/* Angka paket saja menyesatkan: satu nomor punya batas amannya sendiri,
          dan "1.000 sisa" untuk orang yang cuma punya satu nomor berbatas 100
          bukan optimistis — itu salah, dan pengirimannya akan berhenti di pesan
          ke-101 dengan alasan yang tidak nyambung dengan layar. */}
      {quota.bottleneck === "numbers" && (
        <p className="mt-1.5 text-xs text-warning">
          {quota.connectedNumbers === 0
            ? `Paket ${quota.planName} mengizinkan ${angka(quota.limit)} pesan/hari, tapi belum ada nomor WhatsApp tersambung.`
            : `Paket ${quota.planName} mengizinkan ${angka(quota.limit)} pesan/hari, tapi ${quota.connectedNumbers} nomor yang tersambung aman untuk ${angka(quota.numberCapacity)}. Tambah nomor untuk memakai sisa jatah paket.`}
        </p>
      )}
    </div>
  );
}

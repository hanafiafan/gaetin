"use client";

import { useEffect, useState } from "react";

interface T {
  id: string;
  workspace: string;
  kind: string;
  plan: string | null;
  credits: number;
  grossAmount: number;
  status: string;
  createdAt: string;
}

function idr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function AdminTransactions() {
  const [rows, setRows] = useState<T[]>([]);
  useEffect(() => {
    (async () => {
      const r = await fetch("/api/admin/transactions");
      const j = await r.json();
      if (j.success) setRows(j.data);
    })();
  }, []);

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.03] text-left text-xs uppercase text-slate-500">
            <th className="p-3">Tanggal</th>
            <th className="p-3">Workspace</th>
            <th className="p-3">Jenis</th>
            <th className="p-3 text-right">Nominal</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
              <td className="p-3 text-slate-500">{new Date(t.createdAt).toLocaleDateString("id-ID")}</td>
              <td className="p-3 font-bold text-white">{t.workspace}</td>
              <td className="p-3 text-slate-300">{t.kind === "TOPUP" ? `Top-up ${t.credits.toLocaleString("id-ID")} kredit` : `Langganan ${t.plan ?? ""}`}</td>
              <td className="p-3 text-right font-bold tabular-nums text-white">{idr(t.grossAmount)}</td>
              <td className="p-3 text-slate-300">{t.status}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={5} className="p-8 text-center text-slate-500">Belum ada transaksi.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Plan { id: string; name: string; monthlyPrice: number; monthlyCredits: number }
interface PlansData { plans: Plan[]; yearlyDiscount: number }

function idr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function LandingPricing() {
  const [data, setData] = useState<PlansData | null>(null);
  const [cycle, setCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/plans");
      const j = await r.json();
      if (j.success) setData(j.data);
    })();
  }, []);

  if (!data) return <p className="text-center text-sm text-slate-500">Memuat harga...</p>;

  const price = (p: Plan) =>
    cycle === "MONTHLY" ? p.monthlyPrice : Math.round(p.monthlyPrice * 12 * (1 - data.yearlyDiscount));

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <div className="flex gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] p-1 text-sm">
          <button onClick={() => setCycle("MONTHLY")} className={`rounded-full px-4 py-2 font-medium transition-colors ${cycle === "MONTHLY" ? "bg-primary text-black shadow-sm" : "text-slate-400 hover:text-white"}`}>Bulanan</button>
          <button onClick={() => setCycle("YEARLY")} className={`rounded-full px-4 py-2 font-medium transition-colors ${cycle === "YEARLY" ? "bg-primary text-black shadow-sm" : "text-slate-400 hover:text-white"}`}>Tahunan -{Math.round(data.yearlyDiscount * 100)}%</button>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {data.plans.map((p) => {
          const amount = price(p);
          const featured = p.id === "GROWTH";
          return (
            <div key={p.id} className={`cg-card relative rounded-2xl p-6 transition-all hover:-translate-y-1 ${featured ? "border-primary/40 shadow-glow" : ""}`}>
              {featured && <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Paling laku</span>}
              <h3 className="text-lg font-semibold text-white">{p.name}</h3>
              <div className="mt-2 text-3xl font-bold text-white">
                {amount === 0 ? "Gratis" : idr(amount)}
                {amount > 0 && <span className="text-sm font-normal text-slate-400">{cycle === "YEARLY" ? "/tahun" : "/bulan"}</span>}
              </div>
              <p className="mt-1 text-sm text-slate-400">{p.monthlyCredits.toLocaleString("id-ID")} kredit/bulan</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-400">
                <li>Kontak, lead, dan segmentasi</li>
                <li>Dashboard analytics dasar</li>
                <li>Top-up kredit fleksibel</li>
              </ul>
              <Link href={`/register?plan=${p.id}&cycle=${cycle}`}>
                <button className="mt-6 h-11 w-full rounded-full bg-primary px-4 text-sm font-semibold text-black hover:bg-primary/90">
                  {amount === 0 ? "Mulai gratis" : `Pilih ${p.name}`}
                </button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

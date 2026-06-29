import { prisma } from "@/lib/db/prisma";
import { PLANS, type PlanId } from "@/config/plans";
import {
  BarChart3,
  Building2,
  CreditCard,
  DollarSign,
  Search,
  Send,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function idr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-400",
  TRIAL: "bg-amber-500/15 text-amber-400",
  EXPIRED: "bg-red-500/15 text-red-400",
  BLOCKED: "bg-red-500/15 text-red-400",
  CANCELLED: "bg-slate-500/15 text-slate-400",
};
const PLAN_LABEL: Record<string, string> = { STARTER: "Starter", GROWTH: "Bisnis", PRO: "Pro" };

export default async function AdminOverviewPage() {
  const [
    workspaces, users, activeSubs, trialSubs, contacts,
    leads, scraperJobs, blasts,
    paidAgg, usedAgg, activeList,
    recentWorkspaces,
  ] = await Promise.all([
    prisma.workspace.count(),
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "TRIAL" } }),
    prisma.contact.count(),
    prisma.lead.count(),
    prisma.scraperJob.count(),
    prisma.blast.count(),
    prisma.transaction.aggregate({ _sum: { grossAmount: true }, where: { status: "PAID" } }),
    prisma.creditLedger.aggregate({ _sum: { amount: true }, where: { amount: { lt: 0 } } }),
    prisma.subscription.findMany({ where: { status: "ACTIVE" }, select: { plan: true } }),
    prisma.workspace.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true, name: true, credits: true, createdAt: true,
        subscription: { select: { plan: true, status: true } },
        memberships: { where: { role: "OWNER" }, take: 1, select: { user: { select: { email: true } } } },
        _count: { select: { leads: true, contacts: true } },
      },
    }),
  ]);

  const mrr = activeList.reduce((s, x) => s + (PLANS[x.plan as PlanId]?.monthlyPrice ?? 0), 0);
  const revenue = Number(paidAgg._sum.grossAmount ?? 0);
  const creditsUsed = -(usedAgg._sum.amount ?? 0);

  const kpiCards = [
    { label: "MRR (estimasi)", value: idr(mrr), icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total revenue", value: idr(revenue), icon: CreditCard, color: "text-primary", bg: "bg-primary/10" },
    { label: "Workspace", value: workspaces.toLocaleString("id-ID"), icon: Building2, color: "text-primary", bg: "bg-primary/" },
    { label: "User", value: users.toLocaleString("id-ID"), icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Aktif / Trial", value: `${activeSubs} / ${trialSubs}`, icon: BarChart3, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Total kontak", value: contacts.toLocaleString("id-ID"), icon: Users, color: "text-slate-400", bg: "bg-slate-500/10" },
    { label: "Scraper jobs", value: scraperJobs.toLocaleString("id-ID"), icon: Search, color: "text-teal-400", bg: "bg-teal-500/10" },
    { label: "Total blast", value: blasts.toLocaleString("id-ID"), icon: Send, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Lead scraping", value: leads.toLocaleString("id-ID"), icon: Search, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Kredit terpakai", value: creditsUsed.toLocaleString("id-ID"), icon: Zap, color: "text-orange-400", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Overview Platform</h1>
        <p className="mt-1 text-sm text-slate-400">Ringkasan seluruh tenant Gaetin — real-time.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpiCards.map((c) => (
          <div key={c.label} className="cg-card rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold uppercase text-slate-500">{c.label}</p>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${c.bg} ${c.color}`}>
                <c.icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-3 text-xl font-black text-white">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="cg-card rounded-2xl">
        <div className="border-b border-white/[0.08] px-5 py-4">
          <h2 className="text-sm font-black text-white">Workspace terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08]">
                {["Workspace", "Owner", "Paket", "Status", "Lead", "Kontak", "Kredit", ""].map((h) => (
                  <th key={h} className="p-4 text-left text-xs font-bold uppercase text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentWorkspaces.map((w) => (
                <tr key={w.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                  <td className="p-4 font-bold text-white">{w.name}</td>
                  <td className="p-4 text-xs text-slate-400">{w.memberships[0]?.user.email ?? "—"}</td>
                  <td className="p-4 text-xs text-slate-300">{PLAN_LABEL[w.subscription?.plan ?? ""] ?? w.subscription?.plan ?? "—"}</td>
                  <td className="p-4">
                    {w.subscription ? (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_COLOR[w.subscription.status] ?? "bg-slate-500/15 text-slate-400"}`}>
                        {w.subscription.status}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="p-4 tabular-nums text-slate-300">{w._count.leads.toLocaleString("id-ID")}</td>
                  <td className="p-4 tabular-nums text-slate-300">{w._count.contacts.toLocaleString("id-ID")}</td>
                  <td className="p-4 tabular-nums text-white font-bold">{w.credits.toLocaleString("id-ID")}</td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/workspaces/${w.id}`}
                      className="text-xs font-bold text-primary transition hover:underline"
                    >
                      Detail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-white/[0.08] px-5 py-3 text-right">
          <Link href="/admin/workspaces" className="text-xs font-bold text-primary transition hover:underline">
            Lihat semua workspace →
          </Link>
        </div>
      </div>
    </div>
  );
}

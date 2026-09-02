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
  ACTIVE: "bg-success/15 text-success",
  TRIAL: "bg-warning/15 text-warning",
  EXPIRED: "bg-destructive/15 text-destructive",
  BLOCKED: "bg-destructive/15 text-destructive",
  CANCELLED: "bg-muted-foreground/15 text-muted-foreground",
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
    { label: "MRR (estimasi)", value: idr(mrr), icon: DollarSign, color: "text-success", bg: "bg-success/10" },
    { label: "Total revenue", value: idr(revenue), icon: CreditCard, color: "text-foreground", bg: "bg-primary/10" },
    { label: "Workspace", value: workspaces.toLocaleString("id-ID"), icon: Building2, color: "text-foreground", bg: "bg-primary/" },
    { label: "User", value: users.toLocaleString("id-ID"), icon: Users, color: "text-foreground", bg: "bg-muted" },
    { label: "Aktif / Trial", value: `${activeSubs} / ${trialSubs}`, icon: BarChart3, color: "text-warning", bg: "bg-warning/10" },
    { label: "Total kontak", value: contacts.toLocaleString("id-ID"), icon: Users, color: "text-muted-foreground", bg: "bg-muted-foreground/10" },
    { label: "Scraper jobs", value: scraperJobs.toLocaleString("id-ID"), icon: Search, color: "text-teal-400", bg: "bg-teal-500/10" },
    { label: "Total blast", value: blasts.toLocaleString("id-ID"), icon: Send, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Lead scraping", value: leads.toLocaleString("id-ID"), icon: Search, color: "text-foreground", bg: "bg-muted" },
    { label: "Kredit terpakai", value: creditsUsed.toLocaleString("id-ID"), icon: Zap, color: "text-orange-400", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Overview Platform</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ringkasan seluruh tenant Hellens — real-time.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpiCards.map((c) => (
          <div key={c.label} className="cg-card rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">{c.label}</p>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${c.bg} ${c.color}`}>
                <c.icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-3 text-xl font-black text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="cg-card rounded-2xl">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-black text-foreground">Workspace terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Workspace", "Owner", "Paket", "Status", "Lead", "Kontak", "Kredit", ""].map((h) => (
                  <th key={h} className="p-4 text-left text-xs font-bold uppercase text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentWorkspaces.map((w) => (
                <tr key={w.id} className="border-b border-border last:border-0 hover:bg-muted">
                  <td className="p-4 font-bold text-foreground">{w.name}</td>
                  <td className="p-4 text-xs text-muted-foreground">{w.memberships[0]?.user.email ?? "—"}</td>
                  <td className="p-4 text-xs text-foreground">{PLAN_LABEL[w.subscription?.plan ?? ""] ?? w.subscription?.plan ?? "—"}</td>
                  <td className="p-4">
                    {w.subscription ? (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_COLOR[w.subscription.status] ?? "bg-muted-foreground/15 text-muted-foreground"}`}>
                        {w.subscription.status}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="p-4 tabular-nums text-foreground">{w._count.leads.toLocaleString("id-ID")}</td>
                  <td className="p-4 tabular-nums text-foreground">{w._count.contacts.toLocaleString("id-ID")}</td>
                  <td className="p-4 tabular-nums text-foreground font-bold">{w.credits.toLocaleString("id-ID")}</td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/workspaces/${w.id}`}
                      className="text-xs font-bold text-foreground transition hover:underline"
                    >
                      Detail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-5 py-3 text-right">
          <Link href="/admin/workspaces" className="text-xs font-bold text-foreground transition hover:underline">
            Lihat semua workspace →
          </Link>
        </div>
      </div>
    </div>
  );
}

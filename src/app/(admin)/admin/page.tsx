import { prisma } from "@/lib/db/prisma";
import { PLANS, type PlanId } from "@/config/plans";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function idr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

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
      take: 5,
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

  const cards = [
    { label: "Workspace", value: workspaces.toLocaleString("id-ID") },
    { label: "User", value: users.toLocaleString("id-ID") },
    { label: "Langganan aktif", value: activeSubs.toLocaleString("id-ID") },
    { label: "Trial", value: trialSubs.toLocaleString("id-ID") },
    { label: "MRR (estimasi)", value: idr(mrr) },
    { label: "Total revenue (paid)", value: idr(revenue) },
    { label: "Total kontak", value: contacts.toLocaleString("id-ID") },
    { label: "Total lead scraping", value: leads.toLocaleString("id-ID") },
    { label: "Scraper jobs", value: scraperJobs.toLocaleString("id-ID") },
    { label: "Total blast", value: blasts.toLocaleString("id-ID") },
    { label: "Kredit terpakai", value: creditsUsed.toLocaleString("id-ID") },
  ];

  const STATUS_COLOR: Record<string, string> = {
    ACTIVE: "text-green-600", TRIAL: "text-amber-600",
    EXPIRED: "text-red-600", BLOCKED: "text-red-700", CANCELLED: "text-muted-foreground",
  };
  const PLAN_LABEL: Record<string, string> = { STARTER: "Starter", GROWTH: "Bisnis", PRO: "Pro" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview Platform</h1>
        <p className="text-sm text-muted-foreground">Ringkasan seluruh tenant Gaetin.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">{c.label}</div>
              <div className="mt-1 text-2xl font-semibold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 text-sm font-semibold">Workspace terbaru</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="pb-2">Workspace</th>
                  <th className="pb-2">Owner</th>
                  <th className="pb-2">Paket</th>
                  <th className="pb-2 text-center">Lead</th>
                  <th className="pb-2 text-center">Kontak</th>
                  <th className="pb-2 text-right">Kredit</th>
                </tr>
              </thead>
              <tbody>
                {recentWorkspaces.map(w => (
                  <tr key={w.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">
                      {w.name}
                      {w.subscription && (
                        <span className={`ml-2 text-xs ${STATUS_COLOR[w.subscription.status] ?? ""}`}>
                          {w.subscription.status}
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-muted-foreground text-xs">{w.memberships[0]?.user.email ?? "-"}</td>
                    <td className="py-2 text-xs">{PLAN_LABEL[w.subscription?.plan ?? ""] ?? w.subscription?.plan ?? "-"}</td>
                    <td className="py-2 text-center">{w._count.leads}</td>
                    <td className="py-2 text-center">{w._count.contacts}</td>
                    <td className="py-2 text-right tabular-nums">{w.credits.toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

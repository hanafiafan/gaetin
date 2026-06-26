import { prisma } from "@/lib/db/prisma";
import { PLANS, type PlanId } from "@/config/plans";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

function idr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function AdminOverviewPage() {
  const [workspaces, users, activeSubs, trialSubs, contacts, paidAgg, usedAgg, activeList] =
    await Promise.all([
      prisma.workspace.count(),
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count({ where: { status: "TRIAL" } }),
      prisma.contact.count(),
      prisma.transaction.aggregate({ _sum: { grossAmount: true }, where: { status: "PAID" } }),
      prisma.creditLedger.aggregate({ _sum: { amount: true }, where: { amount: { lt: 0 } } }),
      prisma.subscription.findMany({ where: { status: "ACTIVE" }, select: { plan: true } }),
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
    { label: "Kredit terpakai", value: creditsUsed.toLocaleString("id-ID") },
  ];

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
    </div>
  );
}

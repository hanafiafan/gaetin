import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSuperAdminSession } from "@/lib/auth/session";
import { getEffectivePlans } from "@/lib/plans-store";
import { fail } from "@/lib/api";

function sumCounts(rows: { _count: Record<string, number> }[], key: string) {
  return rows.reduce((total, row) => total + (row._count[key] ?? 0), 0);
}

function topCounts(values: Array<string | null>, limit = 8) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    const key = value?.trim();
    if (!key) return acc;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

export async function GET() {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [plansConfig, workspaces, paidAgg, monthPaidAgg, creditAgg, monthCreditAgg, leadSignals, contactSignals, keywordSignals] = await Promise.all([
    getEffectivePlans(),
    prisma.workspace.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        subscription: { select: { plan: true, status: true, billingCycle: true, currentPeriodEnd: true } },
        memberships: {
          where: { role: "OWNER" },
          include: { user: { select: { name: true, email: true } } },
          take: 1,
        },
        transactions: { where: { status: "PAID" }, select: { grossAmount: true } },
        _count: {
          select: {
            contacts: true,
            leads: true,
            scraperJobs: true,
            blasts: true,
            campaigns: true,
            conversations: true,
            tasks: true,
            deals: true,
            tickets: true,
          },
        },
      },
    }),
    prisma.transaction.aggregate({ _sum: { grossAmount: true }, where: { status: "PAID" } }),
    prisma.transaction.aggregate({ _sum: { grossAmount: true }, where: { status: "PAID", paidAt: { gte: monthStart } } }),
    prisma.creditLedger.aggregate({ _sum: { amount: true }, where: { amount: { lt: 0 } } }),
    prisma.creditLedger.aggregate({ _sum: { amount: true }, where: { amount: { lt: 0 }, createdAt: { gte: monthStart } } }),
    prisma.lead.findMany({
      where: { category: { not: null } },
      select: { category: true },
      orderBy: { createdAt: "desc" },
      take: 5000,
    }),
    prisma.contact.findMany({
      where: { category: { not: null } },
      select: { category: true },
      orderBy: { createdAt: "desc" },
      take: 5000,
    }),
    prisma.scraperJob.findMany({
      select: { keyword: true },
      orderBy: { createdAt: "desc" },
      take: 5000,
    }),
  ]);
  const planById = Object.fromEntries(plansConfig.plans.map((plan) => [plan.id, plan]));

  const planDistribution = workspaces.reduce<Record<string, number>>((acc, workspace) => {
    const plan = workspace.subscription?.plan ?? "STARTER";
    acc[plan] = (acc[plan] ?? 0) + 1;
    return acc;
  }, {});

  const statusDistribution = workspaces.reduce<Record<string, number>>((acc, workspace) => {
    const status = workspace.subscription?.status ?? "TRIAL";
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  const customers = workspaces.map((workspace) => {
    const owner = workspace.memberships[0]?.user;
    const revenue = workspace.transactions.reduce((sum, transaction) => sum + Number(transaction.grossAmount), 0);
    const activityScore =
      workspace._count.contacts * 1 +
      workspace._count.leads * 0.5 +
      workspace._count.scraperJobs * 8 +
      workspace._count.blasts * 10 +
      workspace._count.campaigns * 12 +
      workspace._count.conversations * 2 +
      workspace._count.deals * 4;
    const contactCount = workspace._count.contacts;
    const leadCount = workspace._count.leads;
    const outreachCount = workspace._count.blasts + workspace._count.campaigns;
    const plan = workspace.subscription?.plan ?? "STARTER";
    const status = workspace.subscription?.status ?? "TRIAL";
    const isDormant = activityScore === 0 && workspace.createdAt < new Date(Date.now() - 14 * 86_400_000);
    const isLowCredit = workspace.credits < 100;
    const isUpgradeCandidate =
      (plan === "STARTER" && (leadCount >= 100 || workspace._count.scraperJobs >= 5 || outreachCount >= 3)) ||
      (plan === "GROWTH" && (leadCount >= 1000 || outreachCount >= 20 || workspace.credits < 250));
    const health =
      ["BLOCKED", "EXPIRED", "CANCELLED", "TRIAL_EXPIRED"].includes(status) || isDormant
        ? "risk"
        : isUpgradeCandidate
          ? "growth"
          : isLowCredit && activityScore > 0
            ? "watch"
            : "healthy";
    const needs = [
      activityScore === 0 ? "Onboarding" : null,
      leadCount > 0 && contactCount === 0 ? "Bantu konversi lead ke kontak" : null,
      contactCount > 0 && workspace._count.campaigns === 0 && workspace._count.blasts === 0 ? "Dorong campaign pertama" : null,
      workspace._count.deals === 0 && contactCount > 0 ? "Aktifkan tracking closing" : null,
      isLowCredit ? "Top-up kredit" : null,
      isUpgradeCandidate ? "Kandidat upgrade" : null,
    ].filter(Boolean);

    return {
      id: workspace.id,
      workspace: workspace.name,
      ownerName: owner?.name ?? "—",
      ownerEmail: owner?.email ?? "—",
      plan,
      status,
      billingCycle: workspace.subscription?.billingCycle ?? "MONTHLY",
      credits: workspace.credits,
      revenue,
      createdAt: workspace.createdAt,
      currentPeriodEnd: workspace.subscription?.currentPeriodEnd,
      usage: workspace._count,
      activityScore: Math.round(activityScore),
      health,
      needs,
      upgradeCandidate: isUpgradeCandidate,
    };
  });

  const activeCustomers = customers.filter((customer) => customer.activityScore > 0).length;
  const churnRisks = customers.filter((customer) => customer.health === "risk");
  const upgradeCandidates = customers.filter((customer) => customer.upgradeCandidate);
  const lowCredits = customers.filter((customer) => customer.credits < 100);
  const onboardingNeeded = customers.filter((customer) => customer.activityScore === 0);
  const mrrEstimate = customers.reduce((sum, customer) => {
    if (customer.status !== "ACTIVE") return sum;
    return sum + (planById[customer.plan]?.monthlyPrice ?? 0);
  }, 0);
  const topCustomers = [...customers].sort((a, b) => b.activityScore - a.activityScore).slice(0, 10);

  const data = {
    summary: {
      totalCustomers: workspaces.length,
      activeCustomers,
      newCustomers30d: workspaces.filter((workspace) => workspace.createdAt >= thirtyDaysAgo).length,
      mrrEstimate,
      paidRevenue: Number(paidAgg._sum.grossAmount ?? 0),
      monthlyRevenue: Number(monthPaidAgg._sum.grossAmount ?? 0),
      creditsUsed: Number(-(creditAgg._sum.amount ?? 0)),
      monthlyCreditsUsed: Number(-(monthCreditAgg._sum.amount ?? 0)),
      avgContacts:
        workspaces.length > 0 ? Math.round(sumCounts(workspaces, "contacts") / workspaces.length) : 0,
      avgActivityScore:
        customers.length > 0
          ? Math.round(customers.reduce((sum, customer) => sum + customer.activityScore, 0) / customers.length)
          : 0,
      totalLeads: sumCounts(workspaces, "leads"),
      totalCampaigns: sumCounts(workspaces, "campaigns"),
      churnRiskCount: churnRisks.length,
      upgradeCandidateCount: upgradeCandidates.length,
      lowCreditCount: lowCredits.length,
    },
    planDistribution,
    statusDistribution,
    featureUsage: {
      contacts: sumCounts(workspaces, "contacts"),
      leads: sumCounts(workspaces, "leads"),
      scraperJobs: sumCounts(workspaces, "scraperJobs"),
      blasts: sumCounts(workspaces, "blasts"),
      campaigns: sumCounts(workspaces, "campaigns"),
      conversations: sumCounts(workspaces, "conversations"),
      tasks: sumCounts(workspaces, "tasks"),
      deals: sumCounts(workspaces, "deals"),
      tickets: sumCounts(workspaces, "tickets"),
    },
    marketSignals: {
      topLeadCategories: topCounts(leadSignals.map((lead) => lead.category)),
      topContactCategories: topCounts(contactSignals.map((contact) => contact.category)),
      topScraperKeywords: topCounts(keywordSignals.map((job) => job.keyword)),
    },
    actionQueues: {
      lowCredits: lowCredits.slice(0, 10),
      upgradeCandidates: upgradeCandidates.slice(0, 10),
      churnRisks: churnRisks.slice(0, 10),
      onboardingNeeded: onboardingNeeded.slice(0, 10),
    },
    topCustomers,
    customers,
  };

  return NextResponse.json({ success: true, data });
}

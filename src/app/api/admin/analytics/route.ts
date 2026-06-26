import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSuperAdminSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSuperAdminSession();
  if (!session) return fail("FORBIDDEN", "Akses super-admin diperlukan", 403);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    // Time series
    workspacesByDay,
    leadsByDay,
    contactsByDay,
    creditsByDay,
    // Distributions
    planDist,
    statusDist,
    waStatusDist,
    blastStatusDist,
    scraperStatusDist,
    // Category intel
    topLeadCategories,
    topContactCategories,
    topScraperKeywords,
    // Table counts (database stats)
    wsCount, userCount, contactCount, leadCount,
    scraperJobCount, blastCount, campaignCount,
    dealCount, conversationCount, taskCount,
    messageCount, creditLedgerCount,
    // Recent activity
    recentLeads, recentContacts, recentBlasts,
    // Credit totals
    creditsIssuedAgg, creditsUsedAgg,
    // Active this week
    activeWsThisWeek, newLeadsThisWeek, newContactsThisWeek,
  ] = await Promise.all([
    // Daily workspace signups last 30 days
    prisma.$queryRaw<{ date: string; count: number }[]>`
      SELECT TO_CHAR("createdAt" AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') as date,
             COUNT(*)::int as count
      FROM "Workspace"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY TO_CHAR("createdAt" AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD')
      ORDER BY date
    `,
    // Daily leads last 30 days
    prisma.$queryRaw<{ date: string; count: number }[]>`
      SELECT TO_CHAR("createdAt" AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') as date,
             COUNT(*)::int as count
      FROM "Lead"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY TO_CHAR("createdAt" AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD')
      ORDER BY date
    `,
    // Daily contacts last 30 days
    prisma.$queryRaw<{ date: string; count: number }[]>`
      SELECT TO_CHAR("createdAt" AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') as date,
             COUNT(*)::int as count
      FROM "Contact"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY TO_CHAR("createdAt" AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD')
      ORDER BY date
    `,
    // Daily credits issued/used last 30 days
    prisma.$queryRaw<{ date: string; issued: number; used: number }[]>`
      SELECT TO_CHAR("createdAt" AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') as date,
             SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END)::int as issued,
             SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END)::int as used
      FROM "CreditLedger"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY TO_CHAR("createdAt" AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD')
      ORDER BY date
    `,
    // Plan distribution
    prisma.subscription.groupBy({ by: ["plan"], _count: { plan: true } }),
    // Status distribution
    prisma.subscription.groupBy({ by: ["status"], _count: { status: true } }),
    // WA status
    prisma.contact.groupBy({ by: ["waStatus"], _count: { waStatus: true } }),
    // Blast status
    prisma.blast.groupBy({ by: ["status"], _count: { status: true } }),
    // Scraper job status
    prisma.scraperJob.groupBy({ by: ["status"], _count: { status: true } }),
    // Top lead categories
    prisma.lead.groupBy({
      by: ["category"],
      where: { category: { not: null } },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: 10,
    }),
    // Top contact categories
    prisma.contact.groupBy({
      by: ["category"],
      where: { category: { not: null } },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: 10,
    }),
    // Top scraper keywords
    prisma.scraperJob.groupBy({
      by: ["keyword"],
      _count: { keyword: true },
      orderBy: { _count: { keyword: "desc" } },
      take: 10,
    }),
    // Table counts
    prisma.workspace.count(),
    prisma.user.count(),
    prisma.contact.count(),
    prisma.lead.count(),
    prisma.scraperJob.count(),
    prisma.blast.count(),
    prisma.campaign.count(),
    prisma.deal.count(),
    prisma.conversation.count(),
    prisma.task.count(),
    prisma.blastMessage.count(),
    prisma.creditLedger.count(),
    // Recent activity
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { businessName: true, category: true, phone: true, createdAt: true, workspace: { select: { name: true } } } }),
    prisma.contact.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { name: true, phone: true, waStatus: true, createdAt: true, workspace: { select: { name: true } } } }),
    prisma.blast.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { name: true, status: true, recipientCount: true, createdAt: true, workspace: { select: { name: true } } } }),
    // Credits totals
    prisma.creditLedger.aggregate({ _sum: { amount: true }, where: { amount: { gt: 0 } } }),
    prisma.creditLedger.aggregate({ _sum: { amount: true }, where: { amount: { lt: 0 } } }),
    // Active this week
    prisma.workspace.count({ where: { leads: { some: { createdAt: { gte: sevenDaysAgo } } } } }),
    prisma.lead.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.contact.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);

  // Build date range for last 30 days (fill gaps)
  const dateRange: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dateRange.push(d.toISOString().slice(0, 10));
  }

  function fillDates(data: { date: string; count: number }[]) {
    const map = Object.fromEntries(data.map(d => [d.date, Number(d.count)]));
    return dateRange.map(date => ({ date, count: map[date] ?? 0 }));
  }

  function fillCreditDates(data: { date: string; issued: number; used: number }[]) {
    const map = Object.fromEntries(data.map(d => [d.date, { issued: Number(d.issued), used: Number(d.used) }]));
    return dateRange.map(date => ({ date, ...(map[date] ?? { issued: 0, used: 0 }) }));
  }

  const dbStats = [
    { table: "Workspace", count: wsCount },
    { table: "User", count: userCount },
    { table: "Contact", count: contactCount },
    { table: "Lead", count: leadCount },
    { table: "ScraperJob", count: scraperJobCount },
    { table: "Blast", count: blastCount },
    { table: "BlastMessage", count: messageCount },
    { table: "Campaign", count: campaignCount },
    { table: "Deal", count: dealCount },
    { table: "Conversation", count: conversationCount },
    { table: "Task", count: taskCount },
    { table: "CreditLedger", count: creditLedgerCount },
  ];

  return NextResponse.json({
    success: true,
    data: {
      timeSeries: {
        workspaces: fillDates(workspacesByDay as { date: string; count: number }[]),
        leads: fillDates(leadsByDay as { date: string; count: number }[]),
        contacts: fillDates(contactsByDay as { date: string; count: number }[]),
        credits: fillCreditDates(creditsByDay as { date: string; issued: number; used: number }[]),
      },
      distributions: {
        plans: planDist.map(p => ({ name: p.plan, value: p._count.plan })),
        statuses: statusDist.map(s => ({ name: s.status, value: s._count.status })),
        waStatus: waStatusDist.map(w => ({ name: w.waStatus, value: w._count.waStatus })),
        blastStatus: blastStatusDist.map(b => ({ name: b.status, value: b._count.status })),
        scraperStatus: scraperStatusDist.map(s => ({ name: s.status, value: s._count.status })),
      },
      intel: {
        topLeadCategories: topLeadCategories.map(c => ({ name: c.category!, count: c._count.category })),
        topContactCategories: topContactCategories.map(c => ({ name: c.category!, count: c._count.category })),
        topScraperKeywords: topScraperKeywords.map(k => ({ name: k.keyword, count: k._count.keyword })),
      },
      dbStats,
      recentActivity: { recentLeads, recentContacts, recentBlasts },
      credits: {
        totalIssued: Number(creditsIssuedAgg._sum.amount ?? 0),
        totalUsed: Math.abs(Number(creditsUsedAgg._sum.amount ?? 0)),
      },
      weeklyActivity: { activeWsThisWeek, newLeadsThisWeek, newContactsThisWeek },
    },
  });
}

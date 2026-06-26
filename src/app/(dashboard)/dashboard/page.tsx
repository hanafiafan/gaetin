import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Contact,
  MessageSquare,
  Plus,
  Send,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Zap,
  AlertTriangle,
  Building2,
} from "lucide-react";
import Link from "next/link";

function formatIDR(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { feature?: string };
}) {
  const session = await requireSession();
  const workspaceId = session.workspace.id;

  const [contacts, leads, openConversations, wonAgg, subscription, accounts, blasts, campaigns, tasks, workspace, recentLeads] = await Promise.all([
    prisma.contact.count({ where: { workspaceId } }),
    prisma.lead.count({ where: { workspaceId } }),
    prisma.conversation.count({ where: { workspaceId, status: "OPEN" } }),
    prisma.deal.aggregate({ _sum: { value: true }, where: { workspaceId, status: "WON" } }),
    prisma.subscription.findUnique({ where: { workspaceId } }),
    prisma.messagingAccount.count({ where: { workspaceId, status: "CONNECTED" } }),
    prisma.blast.count({ where: { workspaceId } }),
    prisma.campaign.count({ where: { workspaceId } }),
    prisma.task.count({ where: { workspaceId, status: { in: ["PENDING", "OVERDUE"] } } }),
    prisma.workspace.findUnique({ where: { id: workspaceId }, select: { credits: true } }),
    prisma.lead.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { businessName: true, category: true, phone: true, createdAt: true },
    }),
  ]);

  const revenue = Number(wonAgg._sum.value ?? 0);
  const totalPipeline = contacts + leads;
  const contactConversion = totalPipeline > 0 ? Math.round((contacts / totalPipeline) * 100) : 0;
  const credits = workspace?.credits ?? 0;

  const trialDaysLeft =
    subscription?.status === "TRIAL" && subscription.trialEndsAt
      ? Math.max(0, Math.ceil((subscription.trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
      : null;

  const PLAN_LABEL: Record<string, string> = { STARTER: "Starter", GROWTH: "Bisnis", PRO: "Pro" };
  const planLabel = PLAN_LABEL[subscription?.plan ?? "STARTER"] ?? subscription?.plan ?? "Starter";
  const isLowCredits = credits < 100;

  const cards = [
    {
      label: "Total kontak",
      value: contacts.toLocaleString("id-ID"),
      detail: `${contactConversion}% dari alur penjualan tersimpan`,
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "Lead mentah",
      value: leads.toLocaleString("id-ID"),
      detail: "Menunggu kurasi & validasi",
      icon: Target,
      color: "text-violet-400",
    },
    {
      label: "Percakapan terbuka",
      value: openConversations.toLocaleString("id-ID"),
      detail: "Butuh respons tim",
      icon: MessageSquare,
      color: "text-amber-400",
    },
    {
      label: "Nilai closing",
      value: formatIDR(revenue),
      detail: "Deal berstatus menang",
      icon: TrendingUp,
      color: "text-emerald-400",
    },
  ];

  const quickActions = [
    { href: "/dashboard/scraper", label: "Cari lead", icon: Target },
    { href: "/dashboard/contacts/import", label: "Import kontak", icon: Contact },
    { href: "/dashboard/blast", label: "Buat blast", icon: Send },
    { href: "/dashboard/analytics", label: "Lihat laporan", icon: BarChart3 },
  ];

  const onboarding = [
    { label: "Hubungkan WhatsApp", done: accounts > 0, href: "/dashboard/settings" },
    { label: "Tambah kontak pertama", done: contacts > 0, href: "/dashboard/contacts" },
    { label: "Jalankan blast/campaign", done: blasts + campaigns > 0, href: "/dashboard/blast" },
    { label: "Pantau percakapan masuk", done: openConversations > 0, href: "/dashboard/inbox" },
  ];
  const doneSteps = onboarding.filter((step) => step.done).length;

  return (
    <div className="space-y-5">
      {/* Low credits warning */}
      {isLowCredits && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="flex-1 text-sm font-medium text-amber-300">
            Kredit hampir habis ({credits} tersisa). Beli kredit tambahan agar scraping dan validasi tidak terhenti.
          </span>
          <Link href="/dashboard/billing" className="shrink-0 rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 transition hover:bg-amber-500/30">
            Beli kredit
          </Link>
        </div>
      )}

      {searchParams?.feature === "disabled" && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm font-medium text-amber-800 dark:text-amber-300">
          Fitur tersebut sedang dinonaktifkan oleh pemilik sistem melalui Owner CMS.
        </div>
      )}

      {/* Hero header */}
      <div className="overflow-hidden rounded-3xl border bg-card/60 shadow-sm backdrop-blur-xl">
        <div className="grid gap-6 p-6 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col justify-center">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/15 text-primary hover:bg-primary/20">Ringkasan Workspace</Badge>
                {subscription && (
                  <Badge variant="outline" className="text-xs">
                    {planLabel} · {subscription.status === "TRIAL" ? `Trial ${trialDaysLeft ?? 0} hari` : subscription.status}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Halo, {session.user.name.split(" ")[0]}. Mari gaet peluang berikutnya.
              </h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                Pantau lead, kontak, percakapan, dan revenue dari satu ruang kerja operasional.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button key={action.href} asChild variant={action.label === "Cari lead" ? "default" : "outline"} className="rounded-xl">
                    <Link href={action.href}>
                      <Icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border bg-background/50 p-5 shadow-inner">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-foreground">Progress pengaturan</div>
                <div className="mt-1 text-xs text-muted-foreground">{doneSteps} dari {onboarding.length} langkah selesai</div>
              </div>
              {trialDaysLeft !== null && (
                <span className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                  Trial {trialDaysLeft} hari
                </span>
              )}
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(doneSteps / onboarding.length) * 100}%` }} />
            </div>
            <div className="mt-5 space-y-2.5">
              {onboarding.map((step) => (
                <Link
                  key={step.label}
                  href={step.href}
                  className="group flex items-center justify-between rounded-xl bg-card px-3 py-2.5 text-sm font-medium transition hover:bg-muted"
                >
                  <span className="flex items-center gap-2.5">
                    {step.done ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Clock3 className="h-4 w-4 text-muted-foreground" />
                    )}
                    {step.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="rounded-2xl border shadow-sm transition hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">{c.label}</div>
                  <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">{c.value}</div>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 ${c.color}`}>
                  <c.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/50"></span>
                {c.detail}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Credits + workspace status */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Credits card */}
        <Card className={`rounded-2xl border shadow-sm ${isLowCredits ? "border-amber-500/30 bg-amber-500/[0.05]" : ""}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isLowCredits ? "bg-amber-500/15 text-amber-400" : "bg-primary/15 text-primary"}`}>
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Kredit tersisa</div>
                  <div className="text-2xl font-bold text-foreground">{credits.toLocaleString("id-ID")}</div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">{planLabel}</Badge>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              1 kredit = 1 lead disimpan atau 1 nomor divalidasi
            </p>
            <Link href="/dashboard/billing" className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-xl border border-border bg-background/50 text-sm font-semibold transition hover:bg-muted">
              Kelola kredit & tagihan
            </Link>
          </CardContent>
        </Card>

        {/* Alur kerja hari ini */}
        <Card className="rounded-2xl border shadow-sm lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-foreground">Alur kerja hari ini</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Prioritas yang menggerakkan alur penjualan</p>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link href="/dashboard/tasks">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Buat Tugas
                </Link>
              </Button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Lead dikurasi", value: leads, href: "/dashboard/scraper", icon: Target },
                { label: "Inbox terbuka", value: openConversations, href: "/dashboard/inbox", icon: MessageSquare },
                { label: "Tugas aktif", value: tasks, href: "/dashboard/tasks", icon: CheckCircle2 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} href={item.href} className="group flex items-center gap-3 rounded-xl border bg-background/50 p-4 transition hover:bg-muted">
                    <Icon className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                    <div>
                      <div className="text-2xl font-bold text-foreground transition group-hover:text-primary">{item.value.toLocaleString("id-ID")}</div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: recent leads + kondisi */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Recent leads */}
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-foreground">Lead terbaru</h2>
              <Link href="/dashboard/scraper" className="text-xs font-semibold text-primary transition hover:underline">
                Lihat semua
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {recentLeads.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Belum ada lead. <Link href="/dashboard/scraper" className="text-primary hover:underline">Mulai scraping.</Link>
                </div>
              ) : (
                recentLeads.map((lead, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border bg-background/50 px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/60">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{lead.businessName}</p>
                      <p className="text-xs text-muted-foreground">{lead.category ?? "—"}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-medium text-foreground">{lead.phone ?? "—"}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Kondisi workspace */}
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-base font-bold text-foreground">Kondisi workspace</h2>
            <div className="mt-4 space-y-2.5">
              {[
                { icon: ShieldCheck, label: "Nomor WA terhubung", value: accounts },
                { icon: Send, label: "Blast dibuat", value: blasts },
                { icon: Target, label: "Campaign dibuat", value: campaigns },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border bg-background/50 px-4 py-3 text-sm transition hover:bg-muted">
                    <span className="flex items-center gap-2.5 font-medium">
                      <Icon className="h-4 w-4 text-primary" />
                      {item.label}
                    </span>
                    <strong className="text-base tabular-nums">{item.value}</strong>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Chrome,
  Clock3,
  Contact,
  Map,
  MessageSquare,
  Plus,
  Send,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Zap,
  AlertTriangle,
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

  const statCards = [
    { label: "Total kontak", value: contacts.toLocaleString("id-ID"), detail: `${contactConversion}% dari alur penjualan tersimpan`, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Lead mentah", value: leads.toLocaleString("id-ID"), detail: "Menunggu kurasi & validasi", icon: Target, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Percakapan terbuka", value: openConversations.toLocaleString("id-ID"), detail: "Butuh respons tim", icon: MessageSquare, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Nilai closing", value: formatIDR(revenue), detail: "Deal berstatus menang", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  const quickActions = [
    { href: "/dashboard/scraper", label: "Cari lead", icon: Target, primary: true },
    { href: "/dashboard/contacts/import", label: "Import kontak", icon: Contact, primary: false },
    { href: "/dashboard/blast", label: "Buat blast", icon: Send, primary: false },
    { href: "/dashboard/analytics", label: "Lihat laporan", icon: BarChart3, primary: false },
  ];

  const onboarding = [
    { label: "Setup ekstensi Chrome", done: leads > 0, href: "/dashboard/setup" },
    { label: "Hubungkan WhatsApp", done: accounts > 0, href: "/dashboard/settings" },
    { label: "Tambah kontak pertama", done: contacts > 0, href: "/dashboard/contacts" },
    { label: "Jalankan blast/campaign", done: blasts + campaigns > 0, href: "/dashboard/blast" },
  ];

  const isExtensionSetupDone = leads > 0;
  const doneSteps = onboarding.filter((s) => s.done).length;

  return (
    <div className="space-y-5">
      {/* Setup guide banner — show until user has scraped at least once */}
      {!isExtensionSetupDone && (
        <div className="overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Chrome className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-white">Setup ekstensi Chrome dulu</p>
                <p className="mt-0.5 text-sm text-slate-400">
                  Install ekstensi, aktifkan fitur Google Maps, dan izinkan popup — butuh 10 menit saja.
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Chrome className="h-3 w-3" /> Install ekstensi</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Map className="h-3 w-3" /> Aktifkan checkbox Maps</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Izin browser</span>
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/setup"
              className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90"
            >
              Mulai Setup
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

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
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm font-medium text-amber-300">
          Fitur tersebut sedang dinonaktifkan oleh pemilik sistem melalui Owner CMS.
        </div>
      )}

      {/* Hero */}
      <div className="cg-card overflow-hidden rounded-3xl">
        <div className="grid gap-6 p-6 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col justify-center">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">Ringkasan Workspace</span>
                {subscription && (
                  <span className="rounded-full border border-white/[0.08] px-3 py-1 text-xs text-slate-400">
                    {planLabel} · {subscription.status === "TRIAL" ? `Trial ${trialDaysLeft ?? 0} hari` : subscription.status}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Halo, {session.user.name.split(" ")[0]}. Mari gaet peluang berikutnya.
              </h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-400">
                Pantau lead, kontak, percakapan, dan revenue dari satu ruang kerja operasional.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={
                      action.primary
                        ? "flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90"
                        : "flex h-10 items-center gap-2 rounded-full border border-white/[0.08] px-5 text-sm font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary"
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">Progress pengaturan</div>
                <div className="mt-1 text-xs text-slate-500">{doneSteps} dari {onboarding.length} langkah selesai</div>
              </div>
              {trialDaysLeft !== null && (
                <span className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                  Trial {trialDaysLeft} hari
                </span>
              )}
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(doneSteps / onboarding.length) * 100}%` }} />
            </div>
            <div className="mt-5 space-y-2.5">
              {onboarding.map((step) => (
                <Link
                  key={step.label}
                  href={step.href}
                  className="group flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/[0.08] hover:bg-white/[0.04]"
                >
                  <span className="flex items-center gap-2.5">
                    {step.done ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Clock3 className="h-4 w-4 text-slate-500" />
                    )}
                    {step.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-500 opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.label} className="cg-card rounded-2xl p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-400">{c.label}</div>
                <div className="mt-2 text-3xl font-bold tracking-tight text-white">{c.value}</div>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.bg} ${c.color}`}>
                <c.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/50" />
              {c.detail}
            </div>
          </div>
        ))}
      </div>

      {/* Credits + alur kerja */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className={`cg-card rounded-2xl p-6 ${isLowCredits ? "border-amber-500/30" : ""}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isLowCredits ? "bg-amber-500/15 text-amber-400" : "bg-primary/15 text-primary"}`}>
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-400">Kredit tersisa</div>
                <div className="text-2xl font-bold text-white">{credits.toLocaleString("id-ID")}</div>
              </div>
            </div>
            <span className="rounded-full border border-white/[0.08] px-3 py-1 text-xs text-slate-400">{planLabel}</span>
          </div>
          <p className="mt-4 text-xs text-slate-500">1 kredit = 1 lead disimpan atau 1 nomor divalidasi</p>
          <Link href="/dashboard/billing" className="mt-4 flex h-9 w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm font-semibold text-slate-300 transition hover:border-primary/30 hover:text-primary">
            Kelola kredit &amp; tagihan
          </Link>
        </div>

        <div className="cg-card rounded-2xl p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Alur kerja hari ini</h2>
              <p className="mt-0.5 text-xs text-slate-500">Prioritas yang menggerakkan alur penjualan</p>
            </div>
            <Link href="/dashboard/tasks" className="flex h-9 items-center gap-2 rounded-full border border-white/[0.08] px-4 text-sm font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary">
              <Plus className="h-3.5 w-3.5" />
              Buat Tugas
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Lead dikurasi", value: leads, href: "/dashboard/scraper", icon: Target },
              { label: "Inbox terbuka", value: openConversations, href: "/dashboard/inbox", icon: MessageSquare },
              { label: "Tugas aktif", value: tasks, href: "/dashboard/tasks", icon: CheckCircle2 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition hover:border-primary/30 hover:bg-white/[0.04]">
                  <Icon className="h-5 w-5 shrink-0 text-slate-500 transition group-hover:text-primary" />
                  <div>
                    <div className="text-2xl font-bold text-white transition group-hover:text-primary">{item.value.toLocaleString("id-ID")}</div>
                    <div className="text-xs text-slate-500">{item.label}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent leads + workspace status */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="cg-card rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-white">Lead terbaru</h2>
            <Link href="/dashboard/scraper" className="text-xs font-semibold text-primary transition hover:underline">Lihat semua</Link>
          </div>
          <div className="mt-4 space-y-2">
            {recentLeads.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.06] p-6 text-center text-sm text-slate-500">
                Belum ada lead. <Link href="/dashboard/scraper" className="text-primary hover:underline">Mulai scraping.</Link>
              </div>
            ) : (
              recentLeads.map((lead, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
                    <Building2 className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{lead.businessName}</p>
                    <p className="text-xs text-slate-500">{lead.category ?? "—"}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium text-slate-300">{lead.phone ?? "—"}</p>
                    <p className="text-[10px] text-slate-500">{new Date(lead.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="cg-card rounded-2xl p-6">
          <h2 className="text-base font-bold text-white">Kondisi workspace</h2>
          <div className="mt-4 space-y-2.5">
            {[
              { icon: ShieldCheck, label: "Nomor WA terhubung", value: accounts },
              { icon: Send, label: "Blast dibuat", value: blasts },
              { icon: Target, label: "Campaign dibuat", value: campaigns },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-sm transition hover:bg-white/[0.04]">
                  <span className="flex items-center gap-2.5 font-medium text-slate-300">
                    <Icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </span>
                  <strong className="text-base tabular-nums text-white">{item.value}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

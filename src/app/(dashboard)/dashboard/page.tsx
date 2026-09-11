import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getEffectiveStatus } from "@/config/plans";
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
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import MetricStrip from "@/components/dashboard/metric-strip";
import { TONE_SOFT } from "@/components/dashboard/section-tone";

function formatIDR(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { feature?: string; error?: string };
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

  // Badge harus memakai status efektif, bukan kolom mentah — kalau tidak, paket
  // yang sudah lewat tanggal tetap tertulis "ACTIVE" padahal fiturnya terkunci.
  const STATUS_LABEL: Record<string, string> = {
    ACTIVE: "Aktif",
    EXPIRED: "Kedaluwarsa",
    TRIAL_EXPIRED: "Trial berakhir",
    BLOCKED: "Diblokir",
    CANCELLED: "Dibatalkan",
  };
  const effectiveStatus = subscription
    ? getEffectiveStatus(subscription.status, {
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodEnd: subscription.currentPeriodEnd,
      })
    : null;
  const statusLabel =
    effectiveStatus === "TRIAL"
      ? `Trial ${trialDaysLeft ?? 0} hari`
      : (STATUS_LABEL[effectiveStatus ?? ""] ?? effectiveStatus);
  const isLowCredits = credits < 100;

  const metrics = [
    { label: "Total kontak", value: contacts.toLocaleString("id-ID"), hint: `${contactConversion}% dari alur penjualan tersimpan`, icon: Users },
    { label: "Lead mentah", value: leads.toLocaleString("id-ID"), hint: "Menunggu kurasi & validasi", icon: Target },
    { label: "Percakapan terbuka", value: openConversations.toLocaleString("id-ID"), hint: "Butuh respons tim", icon: MessageSquare },
    { label: "Nilai closing", value: formatIDR(revenue), hint: "Deal berstatus menang", icon: TrendingUp, accent: true },
  ];

  const actionCards = [
    { href: "/dashboard/scraper", label: "Cari lead", desc: "Scraping otomatis dari Google Maps", icon: Target, tone: "primary" as const },
    { href: "/dashboard/contacts/import", label: "Import kontak", desc: "Upload database CSV/Excel lama", icon: Contact, tone: "email" as const },
    { href: "/dashboard/campaigns", label: "Buat kampanye", desc: "Kirim pesan personal ke banyak kontak", icon: Send, tone: "whatsapp" as const },
    { href: "/dashboard/analytics", label: "Lihat laporan", desc: "Funnel, revenue, dan ROI kampanye", icon: BarChart3, tone: "kelola" as const },
  ];

  const onboarding = [
    { label: "Setup ekstensi Chrome", done: leads > 0, href: "/dashboard/setup?step=1" },
    { label: "Hubungkan WhatsApp", done: accounts > 0, href: "/dashboard/setup?step=4" },
    { label: "Scraping & kontak pertama", done: contacts > 0, href: "/dashboard/setup?step=5" },
    { label: "Jalankan kampanye pertama", done: blasts + campaigns > 0, href: "/dashboard/campaigns" },
  ];

  const isExtensionSetupDone = leads > 0;
  const doneSteps = onboarding.filter((s) => s.done).length;

  return (
    <div className="space-y-5">
      {/* Setup guide banner — show until user has scraped at least once */}
      {!isExtensionSetupDone && (
        <div className="border-l-2 border-primary bg-muted">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-foreground">
                <Chrome className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-foreground">Setup ekstensi Chrome dulu</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Install ekstensi, aktifkan fitur Google Maps, dan izinkan popup — butuh 10 menit saja.
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
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
              className="cg-press flex h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground"
            >
              Mulai Setup
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {isLowCredits && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-5 py-3.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
          <span className="flex-1 text-sm font-medium text-warning">
            Kredit hampir habis ({credits} tersisa). Beli kredit tambahan agar scraping dan validasi tidak terhenti.
          </span>
          <Link href="/dashboard/billing" className="shrink-0 rounded-xl bg-warning/20 px-3 py-1.5 text-xs font-bold text-warning transition hover:bg-warning/30">
            Beli kredit
          </Link>
        </div>
      )}

      {searchParams?.feature === "disabled" && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-5 py-4 text-sm font-medium text-warning">
          Fitur tersebut sedang dinonaktifkan oleh pemilik sistem melalui Owner CMS.
        </div>
      )}

      {searchParams?.error === "export_forbidden" && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-5 py-4 text-sm font-medium text-warning">
          Ekspor data lead hanya bisa dilakukan oleh Owner atau Admin workspace.
        </div>
      )}

      {/* Baris judul ringkas. Versi sebelumnya adalah hero setinggi 450px berisi
          satu kalimat sambutan — layar pertama habis sebelum satu pun angka
          terlihat. Referensinya membuka halaman dengan judul lalu langsung
          angka. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Ringkasan Workspace
          </span>
          <h1 className="cg-display mt-2 text-[clamp(1.5rem,2.4vw,2rem)]">
            Halo, {session.user.name.split(" ")[0]}. Mari gaet peluang berikutnya.
          </h1>
        </div>
        {subscription && (
          <span className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {planLabel} · {statusLabel}
            {trialDaysLeft !== null ? ` · Trial ${trialDaysLeft} hari` : ""}
          </span>
        )}
      </div>

      {/* Angka workspace, dengan progress pengaturan sebagai kartu gelap
          bersarang di kanannya — pola panel-dalam-panel dari referensi. */}
      <MetricStrip
        items={metrics}
        asideDark
        aside={
          <>
            <div className="cg-label">Progress pengaturan</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {doneSteps} dari {onboarding.length} langkah selesai
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(doneSteps / onboarding.length) * 100}%` }}
              />
            </div>
            <div className="mt-4 space-y-1.5">
              {onboarding.map((step) => (
                <Link
                  key={step.label}
                  href={step.href}
                  className="group flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium text-foreground/80 transition hover:bg-foreground/[0.07] hover:text-foreground"
                >
                  <span className="flex items-center gap-2.5">
                    {step.done ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Clock3 className="h-4 w-4 text-muted-foreground" />
                    )}
                    {step.label}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </>
        }
      />

      {/* Action cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actionCards.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              // Tepi atas 6px warna-warni adalah sisa konsep lama: empat garis
              // berbeda berjajar membuat baris ini berteriak tanpa menambah
              // arti. Warnanya kini hanya di chip ikon, kartunya rata.
              className="cg-card group flex flex-col gap-5 rounded-xl p-4 transition hover:border-foreground/25"
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${TONE_SOFT[action.tone]}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/[0.06] text-foreground/70 transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{action.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{action.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Tugas — satu-satunya metrik di sini yang belum tampil di KPI di atas */}
      <div className="cg-card flex flex-wrap items-center justify-between gap-4 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${TONE_SOFT.kelola}`}>
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <div className="cg-display text-2xl">{tasks.toLocaleString("id-ID")}</div>
            <p className="cg-label text-muted-foreground">Tugas aktif hari ini</p>
          </div>
        </div>
        <Link href="/dashboard/tasks" className="flex h-9 items-center gap-2 border border-border px-4 text-sm font-bold text-foreground/80 transition hover:border-primary/30 hover:text-foreground">
          <Plus className="h-3.5 w-3.5" />
          Buat Tugas
        </Link>
      </div>

      {/* Recent leads + workspace status */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="cg-card rounded-xl p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="cg-display text-xl">Lead terbaru</h2>
            <Link href="/dashboard/scraper" className="text-xs font-semibold text-foreground transition hover:underline">Lihat semua</Link>
          </div>
          <div className="mt-4 space-y-2">
            {recentLeads.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Belum ada lead. <Link href="/dashboard/scraper" className="text-foreground hover:underline">Mulai scraping.</Link>
              </div>
            ) : (
              recentLeads.map((lead, i) => (
                <div key={i} className="flex items-center gap-3 border border-border bg-card px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-muted">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{lead.businessName}</p>
                    <p className="text-xs text-muted-foreground">{lead.category ?? "—"}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium text-foreground/80">{lead.phone ?? "—"}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="cg-card rounded-xl p-5">
          <h2 className="text-base font-bold text-foreground">Kondisi workspace</h2>
          <div className="mt-4 space-y-2.5">
            {[
              { icon: ShieldCheck, label: "Nomor WA terhubung", value: accounts },
              { icon: Send, label: "Kampanye dibuat", value: blasts + campaigns },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm transition hover:bg-muted">
                  <span className="flex items-center gap-2.5 font-medium text-foreground/80">
                    <Icon className="h-4 w-4 text-whatsapp" />
                    {item.label}
                  </span>
                  <strong className="text-base tabular-nums text-foreground">{item.value}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

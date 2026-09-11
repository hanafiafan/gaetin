import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getEffectiveStatus } from "@/config/plans";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Contact,
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
import WorkflowGuide from "@/components/dashboard/workflow-guide";
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
    { label: "Kontak tersimpan", value: contacts.toLocaleString("id-ID"), hint: "Calon pembeli yang sudah masuk daftarmu", icon: Users },
    { label: "Hasil pencarian", value: leads.toLocaleString("id-ID"), hint: "Dari Google Maps, belum disimpan jadi kontak", icon: Target },
    { label: "Belum dibalas", value: openConversations.toLocaleString("id-ID"), hint: "Pesan masuk yang menunggu jawabanmu", icon: MessageSquare },
    { label: "Uang masuk", value: formatIDR(revenue), hint: "Total dari penjualan yang sudah jadi", icon: TrendingUp, accent: true },
  ];

  const actionCards = [
    { href: "/dashboard/scraper", label: "Cari bisnis di Maps", desc: "Ambil nama dan nomor dari Google Maps", icon: Target, tone: "primary" as const },
    { href: "/dashboard/contacts/import", label: "Unggah kontak lama", desc: "Punya daftar di Excel? Masukkan ke sini", icon: Contact, tone: "email" as const },
    { href: "/dashboard/campaigns", label: "Kirim pesan massal", desc: "Satu pesan ke banyak kontak sekaligus", icon: Send, tone: "whatsapp" as const },
    { href: "/dashboard/analytics", label: "Lihat laporan", desc: "Berapa yang membalas dan yang membeli", icon: BarChart3, tone: "kelola" as const },
  ];

  // Alur kerja sebenarnya, bukan daftar pemasangan. Urutannya persis cara
  // aplikasi ini dipakai sehari-hari, dan tiap langkah "selesai" ditentukan
  // dari data nyata — bukan dari centang manual yang bisa bohong.
  const workflow = [
    {
      title: "Pasang alat di browser Chrome",
      desc: "Sekali saja. Alat inilah yang nanti mengambil data bisnis dari Google Maps.",
      href: "/dashboard/setup",
      cta: "Mulai pasang",
      done: leads > 0 || contacts > 0,
    },
    {
      title: "Sambungkan nomor WhatsApp",
      desc: "Nomor ini yang dipakai mengirim pesan. Bisa lebih dari satu.",
      href: "/dashboard/settings",
      cta: "Sambungkan",
      done: accounts > 0,
    },
    {
      title: "Cari calon pembeli di Google Maps",
      desc: "Ketik jenis usaha dan kotanya, lalu simpan hasilnya jadi daftar kontak.",
      href: "/dashboard/scraper",
      cta: "Cari sekarang",
      done: contacts > 0,
    },
    {
      title: "Kirim pesan ke mereka",
      desc: "Satu pesan, banyak penerima. Nama tiap orang disisipkan otomatis.",
      href: "/dashboard/campaigns",
      cta: "Kirim pesan",
      done: blasts + campaigns > 0,
    },
    {
      title: "Balas dan catat yang jadi beli",
      desc: "Balasan masuk ke Pesan Masuk. Yang serius, pindahkan ke Peluang Penjualan.",
      href: "/dashboard/inbox",
      cta: "Lihat balasan",
      done: revenue > 0,
    },
  ];

  const isExtensionSetupDone = leads > 0;

  return (
    <div className="space-y-5">
      {/* Banner "setup dulu" dihapus. Syarat selesainya berbeda dari panduan
          alur di bawah, sehingga satu layar bisa menyuruh memasang ekstensi
          sekaligus menyatakan pemasangannya sudah beres. Satu sumber
          kebenaran: WorkflowGuide. */}

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
          <span className="inline-flex items-center rounded-md bg-primary/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-foreground">
            Mulai
          </span>
          <h1 className="cg-display mt-2.5 text-[clamp(1.75rem,2.8vw,2.35rem)]">
            Halo, {session.user.name.split(" ")[0]}
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Ini ringkasan workspace-mu. Kalau bingung harus mulai dari mana, ikuti lima langkah di bawah.
          </p>
        </div>
        {subscription && (
          <span className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {planLabel} · {statusLabel}
            {trialDaysLeft !== null ? ` · Trial ${trialDaysLeft} hari` : ""}
          </span>
        )}
      </div>

      {/* Angka workspace dulu — sekali lihat tahu posisi hari ini. */}
      <MetricStrip items={metrics} />

      {/* Lalu alur kerjanya. Ini bagian terpenting halaman untuk orang yang
          baru pertama masuk: satu langkah disorot sebagai giliran sekarang,
          sisanya jelas sudah atau belum. */}
      <WorkflowGuide steps={workflow} />

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
        <Link href="/dashboard/tasks" className="flex h-10 items-center gap-2 border border-border px-4 text-sm font-bold text-foreground/80 transition hover:border-primary/30 hover:text-foreground">
          <Plus className="h-3.5 w-3.5" />
          Buat Tugas
        </Link>
      </div>

      {/* Recent leads + workspace status */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="cg-card rounded-xl p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="cg-display text-xl">Bisnis yang baru ditemukan</h2>
            <Link href="/dashboard/scraper" className="text-xs font-semibold text-foreground transition hover:underline">Lihat semua</Link>
          </div>
          <div className="mt-4 space-y-2">
            {recentLeads.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Belum ada lead. <Link href="/dashboard/scraper" className="text-foreground hover:underline">Mulai cari sekarang.</Link>
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
                    <p className="text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
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

import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getEffectiveStatus } from "@/config/plans";
import {
  AlertTriangle,
  Building2,
  ArrowUpRight,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import MetricStrip from "@/components/dashboard/metric-strip";
import WorkflowGuide from "@/components/dashboard/workflow-guide";

function formatIDR(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function DashboardPage({
  searchParams: searchParamsPromise,
}: {
  searchParams?: Promise<{ feature?: string; error?: string }>;
}) {
  const searchParams = await searchParamsPromise;
  const session = await requireSession();
  const workspaceId = session.workspace.id;

  const [contacts, leads, openConversations, wonAgg, subscription, accounts, blasts, campaigns, tasks, workspace, recentLeads] = await Promise.all([
    prisma.contact.count({ where: { workspaceId } }),
    prisma.lead.count({ where: { workspaceId } }),
    prisma.conversation.count({ where: { workspaceId, status: "OPEN", unreadCount: { gt: 0 } } }),
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
    { label: "Kontak tersimpan", value: contacts.toLocaleString("id-ID"), hint: "Calon pembeli yang sudah masuk daftarmu", icon: Users, href: "/dashboard/contacts" },
    { label: "Tugas terbuka", value: tasks.toLocaleString("id-ID"), hint: "Pekerjaan yang belum kamu selesaikan", icon: CheckCircle2, href: "/dashboard/tasks" },
    { label: "Belum dibaca", value: openConversations.toLocaleString("id-ID"), hint: "Percakapan dengan pesan yang belum dibaca", icon: MessageSquare, href: "/dashboard/inbox" },
    { label: "Penjualan tercatat", value: formatIDR(revenue), hint: "Total dari penjualan yang sudah jadi", icon: TrendingUp, accent: true, href: "/dashboard/crm" },
  ];


  // Alur kerja sebenarnya, bukan daftar pemasangan. Urutannya persis cara
  // aplikasi ini dipakai sehari-hari, dan tiap langkah "selesai" ditentukan
  // dari data nyata — bukan dari centang manual yang bisa bohong.
  const workflow = [
    {
      title: "Siapkan alat pencarian",
      desc: "Sekali saja. Alat inilah yang nanti mengambil data bisnis dari Google Maps.",
      href: "/dashboard/setup",
      cta: "Mulai pasang",
      done: leads > 0 || contacts > 0,
    },
    {
      title: "Hubungkan WhatsApp",
      desc: "Nomor ini yang dipakai mengirim pesan. Bisa lebih dari satu.",
      href: "/dashboard/settings",
      cta: "Sambungkan",
      done: accounts > 0,
    },
    {
      title: "Kumpulkan prospek",
      desc: "Ketik jenis usaha dan kotanya, lalu simpan hasilnya jadi daftar kontak.",
      href: "/dashboard/scraper",
      cta: "Cari sekarang",
      done: contacts > 0,
    },
    {
      title: "Mulai pengiriman",
      desc: "Satu pesan, banyak penerima. Nama tiap orang disisipkan otomatis.",
      href: "/dashboard/campaigns",
      cta: "Kirim pesan",
      done: blasts + campaigns > 0,
    },
    {
      title: "Kelola penjualan",
      desc: "Balasan masuk ke Pesan Masuk. Yang serius, pindahkan ke Peluang Penjualan.",
      href: "/dashboard/inbox",
      cta: "Lihat balasan",
      done: revenue > 0,
    },
  ];


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
          <span className="inline-flex items-center text-xs font-medium tracking-wide text-muted-foreground">
            Workspace / Ringkasan
          </span>
          <h1 className="cg-display mt-2.5 text-[clamp(1.75rem,2.8vw,2.35rem)]">
            Ringkasan workspace
          </h1>
          <p className="mt-2 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Pantau prospek, tindak lanjuti percakapan, dan tentukan langkah berikutnya.
          </p>
        </div>
        {subscription && (
          <span className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {planLabel} · {statusLabel}

          </span>
        )}
      </div>

      {/* Angka workspace dulu — sekali lihat tahu posisi hari ini. */}
      <MetricStrip items={metrics} />

      {/* Lalu alur kerjanya. Ini bagian terpenting halaman untuk orang yang
          baru pertama masuk: satu langkah disorot sebagai giliran sekarang,
          sisanya jelas sudah atau belum. */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <WorkflowGuide steps={workflow} />
        <aside className="cg-onyx flex flex-col justify-between rounded-3xl border border-white/10 p-6">
          <div>
            <span className="text-xs text-muted-foreground">PERLU PERHATIAN</span>
            <h2 className="mt-5 text-xl font-medium">Fokus berikutnya</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Selesaikan pekerjaan yang sedang menunggu.</p>
            <div className="mt-6 divide-y divide-border">
              {[{label: "Percakapan belum dibaca", value: openConversations, href: "/dashboard/inbox"}, {label: "Tugas terbuka", value: tasks, href: "/dashboard/tasks"}].map(item => (
                <Link key={item.href} href={item.href} className="flex items-center justify-between gap-3 py-4 text-sm hover:text-primary"><span>{item.label}</span><span className="flex items-center gap-3 font-semibold">{item.value}<ArrowUpRight className="h-4 w-4" /></span></Link>
              ))}
            </div>
          </div>
          <Link href={accounts ? "/dashboard/campaigns" : "/dashboard/settings"} className="mt-6 flex min-h-11 items-center justify-between rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">{accounts ? "Buat pengiriman" : "Hubungkan WhatsApp"}<ArrowUpRight className="h-4 w-4" /></Link>
        </aside>
      </div>

      {/* Tiga blok dihapus di sini, semuanya mengulang isi layar yang sama:

          - Empat "kartu aksi" (Cari bisnis, Unggah kontak, Kirim pesan, Lihat
            laporan). Tiga di antaranya sudah jadi langkah di panduan alur tepat
            di atasnya, dan keempatnya sudah ada di menu.
          - Strip "Tugas aktif hari ini" — satu angka dan satu tombol memakan
            satu baris penuh. Angkanya dipindah ke strip metrik di atas.
          - Panel "Kondisi workspace" — isinya "Nomor WA terhubung" dan
            "Kampanye dibuat", yaitu langkah 2 dan 4 dari panduan alur yang
            ditulis ulang sebagai angka. */}

      {/* Bisnis yang baru ditemukan */}
      <div className="cg-card cg-sheet rounded-xl p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Bisnis yang baru ditemukan</h2>
            <Link href="/dashboard/scraper" className="text-xs font-semibold text-foreground transition hover:underline">Lihat semua</Link>
          </div>
          <div className="mt-4 space-y-2">
            {recentLeads.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Belum ada bisnis yang ditemukan. <Link href="/dashboard/scraper" className="text-foreground hover:underline">Mulai cari sekarang.</Link>
              </div>
            ) : (
              recentLeads.map((lead, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
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
    </div>
  );
}

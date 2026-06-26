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

  const [contacts, leads, openConversations, wonAgg, subscription, accounts, blasts, campaigns, tasks] = await Promise.all([
    prisma.contact.count({ where: { workspaceId } }),
    prisma.lead.count({ where: { workspaceId } }),
    prisma.conversation.count({ where: { workspaceId, status: "OPEN" } }),
    prisma.deal.aggregate({ _sum: { value: true }, where: { workspaceId, status: "WON" } }),
    prisma.subscription.findUnique({ where: { workspaceId } }),
    prisma.messagingAccount.count({ where: { workspaceId, status: "CONNECTED" } }),
    prisma.blast.count({ where: { workspaceId } }),
    prisma.campaign.count({ where: { workspaceId } }),
    prisma.task.count({ where: { workspaceId, status: { in: ["PENDING", "OVERDUE"] } } }),
  ]);

  const revenue = Number(wonAgg._sum.value ?? 0);
  const totalPipeline = contacts + leads;
  const contactConversion = totalPipeline > 0 ? Math.round((contacts / totalPipeline) * 100) : 0;

  const trialDaysLeft =
    subscription?.status === "TRIAL" && subscription.trialEndsAt
      ? Math.max(0, Math.ceil((subscription.trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
      : null;

  const cards = [
    {
      label: "Total kontak",
      value: contacts.toLocaleString("id-ID"),
      detail: `${contactConversion}% dari alur penjualan tersimpan`,
      icon: Users,
    },
    {
      label: "Lead mentah",
      value: leads.toLocaleString("id-ID"),
      detail: "Menunggu kurasi",
      icon: Target,
    },
    {
      label: "Percakapan terbuka",
      value: openConversations.toLocaleString("id-ID"),
      detail: "Butuh respons tim",
      icon: MessageSquare,
    },
    {
      label: "Nilai closing",
      value: formatIDR(revenue),
      detail: "Deal berstatus menang",
      icon: TrendingUp,
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
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border bg-card/60 shadow-sm backdrop-blur-xl">
        <div className="grid gap-6 p-6 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col justify-center">
            <div>
              <Badge className="mb-4 bg-primary/15 text-primary hover:bg-primary/20">Ringkasan Workspace</Badge>
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

      {searchParams?.feature === "disabled" && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm font-medium text-amber-800 dark:text-amber-300">
          Fitur tersebut sedang dinonaktifkan oleh pemilik sistem melalui Owner CMS.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="rounded-2xl border shadow-sm transition hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">{c.label}</div>
                  <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">{c.value}</div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
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

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="rounded-3xl border shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Alur kerja hari ini</h2>
                <p className="mt-1 text-sm font-medium text-muted-foreground">Prioritas yang biasanya menggerakkan alur penjualan.</p>
              </div>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/dashboard/tasks">
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Tugas
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Kurasi lead", value: leads, href: "/dashboard/scraper" },
                { label: "Balas inbox", value: openConversations, href: "/dashboard/inbox" },
                { label: "Tugas aktif", value: tasks, href: "/dashboard/tasks" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="group flex flex-col rounded-2xl border bg-background/50 p-5 transition hover:bg-muted">
                  <div className="text-3xl font-bold text-foreground transition group-hover:text-primary">{item.value.toLocaleString("id-ID")}</div>
                  <div className="mt-2 text-sm font-medium text-muted-foreground">{item.label}</div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground">Kondisi workspace</h2>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-xl border bg-background/50 px-4 py-3.5 text-sm transition hover:bg-muted">
                <span className="flex items-center gap-3 font-medium"><ShieldCheck className="h-5 w-5 text-primary" /> Nomor WA terhubung</span>
                <strong className="text-lg">{accounts}</strong>
              </div>
              <div className="flex items-center justify-between rounded-xl border bg-background/50 px-4 py-3.5 text-sm transition hover:bg-muted">
                <span className="flex items-center gap-3 font-medium"><Send className="h-5 w-5 text-primary" /> Blast dibuat</span>
                <strong className="text-lg">{blasts}</strong>
              </div>
              <div className="flex items-center justify-between rounded-xl border bg-background/50 px-4 py-3.5 text-sm transition hover:bg-muted">
                <span className="flex items-center gap-3 font-medium"><Target className="h-5 w-5 text-primary" /> Campaign dibuat</span>
                <strong className="text-lg">{campaigns}</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

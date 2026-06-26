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
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">Ringkasan Workspace</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">
              Halo, {session.user.name.split(" ")[0]}. Mari gaet peluang berikutnya.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Pantau lead, kontak, percakapan, dan revenue dari satu ruang kerja operasional.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button key={action.href} asChild variant={action.label === "Cari lead" ? "default" : "outline"} size="sm">
                    <Link href={action.href}>
                      <Icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Progress pengaturan</div>
                <div className="text-xs text-muted-foreground">{doneSteps} dari {onboarding.length} langkah selesai</div>
              </div>
              {trialDaysLeft !== null && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Trial {trialDaysLeft} hari
                </span>
              )}
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(doneSteps / onboarding.length) * 100}%` }} />
            </div>
            <div className="mt-4 space-y-2">
              {onboarding.map((step) => (
                <Link
                  key={step.label}
                  href={step.href}
                  className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <span className="flex items-center gap-2">
                    {step.done ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock3 className="h-4 w-4 text-muted-foreground" />
                    )}
                    {step.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {searchParams?.feature === "disabled" && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          Fitur tersebut sedang dinonaktifkan oleh pemilik sistem melalui Owner CMS.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="rounded-xl shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">{c.label}</div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">{c.value}</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">{c.detail}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Alur kerja hari ini</h2>
                <p className="mt-1 text-sm text-muted-foreground">Prioritas yang biasanya menggerakkan alur penjualan.</p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/tasks">
                  <Plus className="mr-2 h-4 w-4" />
                  Tugas
                </Link>
              </Button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                { label: "Kurasi lead", value: leads, href: "/dashboard/scraper" },
                { label: "Balas inbox", value: openConversations, href: "/dashboard/inbox" },
                { label: "Tugas aktif", value: tasks, href: "/dashboard/tasks" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="rounded-xl border bg-muted/30 p-4 transition-colors hover:bg-muted">
                  <div className="text-2xl font-semibold">{item.value.toLocaleString("id-ID")}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{item.label}</div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Kondisi workspace</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Nomor WA terhubung</span>
                <strong>{accounts}</strong>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                <span>Blast dibuat</span>
                <strong>{blasts}</strong>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                <span>Campaign dibuat</span>
                <strong>{campaigns}</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

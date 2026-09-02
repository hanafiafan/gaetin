import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { MapHistoryClient } from "@/components/dashboard/map-history-client";
import { Badge } from "@/components/ui/badge";
import { MapPinned } from "lucide-react";

export default async function MapHistoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const leads = await prisma.lead.findMany({
    where: {
      workspaceId: session.workspace.id,
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      businessName: true,
      category: true,
      latitude: true,
      longitude: true,
      scraperJob: {
        select: { color: true, name: true, keyword: true }
      }
    }
  });

  return (
    <div className="flex h-[calc(100vh-76px)] flex-col gap-4 p-4 md:gap-6 md:p-6 lg:p-8">
      <div>
        <Badge className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-foreground hover:bg-primary/15">
          <MapPinned className="h-3.5 w-3.5" /> Geo Intelligence
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">History Maps</h1>
        <p className="mt-2 text-sm text-muted-foreground">Peta sebaran dari seluruh kontak yang berhasil disimpan dari hasil scraping.</p>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-border bg-card">
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center text-muted-foreground">Memuat peta...</div>}>
          <MapHistoryClient leads={leads as any} />
        </Suspense>
      </div>
    </div>
  );
}

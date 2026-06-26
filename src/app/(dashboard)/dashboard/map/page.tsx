import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { MapHistoryClient } from "@/components/dashboard/map-history-client";

export default async function MapHistoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Fetch all leads that have coordinates
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
        <h1 className="text-2xl font-bold tracking-tight">History Maps</h1>
        <p className="text-muted-foreground">Peta sebaran dari seluruh kontak yang berhasil disimpan dari hasil scraping.</p>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden shadow-sm border bg-card">
        <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-muted/20">Memuat peta...</div>}>
          <MapHistoryClient leads={leads as any} />
        </Suspense>
      </div>
    </div>
  );
}

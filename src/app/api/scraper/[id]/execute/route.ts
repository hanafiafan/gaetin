import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { runScraperJob } from "@/lib/scraper/service";
import { prisma } from "@/lib/db/prisma";

export const maxDuration = 60; // Allow maximum 60 seconds execution time on Vercel Hobby

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const job = await prisma.scraperJob.findUnique({ where: { id: params.id } });
  if (!job || job.workspaceId !== session.workspace.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Execute the scraper job synchronously so Vercel does not kill the process
  await runScraperJob(params.id);

  return NextResponse.json({ success: true });
}

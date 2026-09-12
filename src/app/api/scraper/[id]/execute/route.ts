import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { enqueue } from "@/lib/jobs/queue";
import { prisma } from "@/lib/db/prisma";

export const maxDuration = 60; // Allow maximum 60 seconds execution time on Vercel Hobby

export async function POST(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const job = await prisma.scraperJob.findUnique({ where: { id: params.id } });
  if (!job || job.workspaceId !== session.workspace.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Execute the scraper job synchronously so Vercel does not kill the process
  if (job.status !== "RUNNING") return NextResponse.json({ error: "Job is not running" }, { status: 409 });
  await prisma.$transaction((tx) => enqueue(tx, "SCRAPER", job.id, session.workspace.id));

  return NextResponse.json({ success: true }, { status: 202 });
}

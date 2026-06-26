import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { fail } from "@/lib/api";

const TERMINAL = new Set(["COMPLETED", "FAILED", "STOPPED"]);

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const job = await prisma.scraperJob.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
  });
  if (!job) return fail("NOT_FOUND", "Job tidak ditemukan", 404);

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      const tick = async () => {
        if (closed) return;
        try {
          const j = await prisma.scraperJob.findUnique({
            where: { id: params.id },
            select: { status: true, totalFound: true, duplicates: true },
          });
          if (!j) { closed = true; controller.close(); return; }
          send({ status: j.status, totalFound: j.totalFound, duplicates: j.duplicates });
          if (TERMINAL.has(j.status)) { closed = true; controller.close(); return; }
        } catch {
          closed = true;
          try { controller.close(); } catch { /* already closed */ }
          return;
        }
        setTimeout(tick, 1500);
      };

      await tick();
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

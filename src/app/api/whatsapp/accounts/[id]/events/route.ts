import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { startConnection, getState, addAccountListener } from "@/lib/whatsapp/manager";
import { fail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const account = await prisma.messagingAccount.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    select: { id: true },
  });
  if (!account) return fail("NOT_FOUND", "Akun WhatsApp tidak ditemukan", 404);

  // Kick off connection (idempotent — safe to call even if already connecting)
  startConnection(account.id).catch(() => undefined);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function send(data: object) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // stream already closed
        }
      }

      // Immediately push current state if QR already exists (e.g. reconnect to existing session)
      const current = getState(account.id);
      if (current.qr) send({ type: "qr", qr: current.qr });
      if (current.status === "connected") {
        send({ type: "status", status: "connected" });
        controller.close();
        return;
      }

      const unsubscribe = addAccountListener(account.id, (ev) => {
        send(ev);
        if (ev.type === "status" && (ev.status === "connected" || ev.status === "disconnected")) {
          unsubscribe();
          try { controller.close(); } catch { /* already closed */ }
        }
      });

      req.signal.addEventListener("abort", () => {
        unsubscribe();
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

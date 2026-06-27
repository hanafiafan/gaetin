import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { gwConnect, gwGetQr } from "@/lib/whatsapp/gateway-client";
import { fail } from "@/lib/api";

export const dynamic = "force-dynamic";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);

  const account = await prisma.messagingAccount.findFirst({
    where: { id: params.id, workspaceId: session.workspace.id },
    select: { id: true },
  });
  if (!account) return fail("NOT_FOUND", "Akun WhatsApp tidak ditemukan", 404);

  // Mulai koneksi di gateway (idempoten)
  try {
    await gwConnect(account.id);
  } catch (e) {
    console.error("[events] gwConnect failed:", e instanceof Error ? e.message : e);
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch { /* stream closed */ }
      }

      let prevQr = "";
      let done = false;
      const startedAt = Date.now();
      const MAX_WAIT_MS = 120_000; // 120 detik — cukup untuk QR muncul + user scan + auth WhatsApp

      req.signal.addEventListener("abort", () => { done = true; });

      // Poll gateway setiap 1.5 detik sampai QR muncul atau connected
      while (!done) {
        // Timeout: kalau 60 detik belum dapat QR, stop dan suruh client coba lagi
        if (Date.now() - startedAt > MAX_WAIT_MS) {
          console.error(`[events] Timeout 60s — no QR received for account ${account.id}`);
          send({ type: "error", message: "QR timeout, silakan coba lagi" });
          done = true;
          break;
        }

        try {
          const state = await gwGetQr(account.id);
          console.log(`[events] poll status=${state.status} hasQr=${!!state.qr}`);

          if (state.qr && state.qr !== prevQr) {
            prevQr = state.qr;
            send({ type: "qr", qr: state.qr });
          }

          if (state.status === "connected") {
            await prisma.messagingAccount
              .update({
                where: { id: account.id },
                data: {
                  status: "CONNECTED",
                  phoneNumber: state.phone ?? undefined,
                  lastConnected: new Date(),
                },
              })
              .catch(() => undefined);
            send({ type: "status", status: "connected" });
            done = true;
          } else if (state.status === "disconnected") {
            // Disconnected tanpa QR = gateway gagal start, atau session sudah invalid
            send({ type: "status", status: "disconnected" });
            done = true;
          }
        } catch (e) {
          console.error("[events] gwGetQr failed:", e instanceof Error ? e.message : e);
        }

        if (!done) await sleep(1500);
      }

      try { controller.close(); } catch { /* already closed */ }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}

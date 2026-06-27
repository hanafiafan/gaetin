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
  await gwConnect(account.id).catch(() => undefined);

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

      req.signal.addEventListener("abort", () => { done = true; });

      // Poll gateway setiap 1.5 detik sampai QR muncul atau connected
      while (!done) {
        try {
          const state = await gwGetQr(account.id);

          if (state.qr && state.qr !== prevQr) {
            prevQr = state.qr;
            send({ type: "qr", qr: state.qr });
          }

          if (state.status === "connected") {
            // Update DB dan informasikan client
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
          } else if (state.status === "disconnected" && prevQr) {
            // QR sudah pernah dikirim tapi koneksi gagal
            send({ type: "status", status: "disconnected" });
            done = true;
          }
        } catch { /* gateway tidak bisa dihubungi, coba lagi */ }

        if (!done) await sleep(1500);
      }

      try { controller.close(); } catch { /* already closed */ }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}

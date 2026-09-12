import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { handleIncomingMessage } from "@/lib/inbox/service";
import { secureEqual } from "@/lib/secure-compare";

const Schema = z.discriminatedUnion("event", [
  z.object({ event: z.literal("connected"), accountId: z.string().min(1), phone: z.string().optional() }),
  z.object({ event: z.literal("disconnected"), accountId: z.string().min(1) }),
  z.object({ event: z.literal("message"), accountId: z.string().min(1), phone: z.string().min(1), text: z.string(), msgId: z.string().min(1), occurredAt: z.string().datetime().optional() }),
]);
export async function POST(req: NextRequest) {
  const expected = process.env.WEBHOOK_SECRET ?? "";
  if (!expected || !secureEqual(req.headers.get("x-webhook-secret") ?? "", expected)) return NextResponse.json({ ok: false }, { status: 403 });
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid event" }, { status: 400 });
  const body = parsed.data;
  try {
    if (body.event === "message") await handleIncomingMessage(body.accountId, body.phone, body.text, body.msgId, body.occurredAt ? new Date(body.occurredAt) : new Date());
    else await prisma.messagingAccount.updateMany({ where: { id: body.accountId }, data: body.event === "connected"
      ? { status: "CONNECTED", phoneNumber: body.phone, lastConnected: new Date() }
      : { status: "DISCONNECTED" } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("WhatsApp webhook persistence failed", err);
    return NextResponse.json({ ok: false, error: "Persistence failed; retry required" }, { status: 503 });
  }
}

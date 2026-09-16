import { featureDenied } from "@/lib/auth/entitlements";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("AUTH_003", "Tidak terautentikasi", 401);
  const denied = await featureDenied(session.workspace.id, "inbox");
  if (denied) return denied;

  const rows = await prisma.conversation.findMany({
    where: { workspaceId: session.workspace.id },
    orderBy: { lastMessageAt: "desc" },
    include: {
      contact: { select: { id: true, name: true, phone: true } },
      // Cuplikan pesan terakhir: tanpa ini daftar percakapan cuma berisi nama
      // dan nomor, dan satu-satunya cara tahu isi percakapannya adalah membuka
      // semuanya satu per satu.
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true, direction: true } },
    },
    take: 200,
  });

  const data = rows.map((c) => ({
    id: c.id,
    contactId: c.contact.id,
    name: c.contact.name,
    phone: c.contact.phone,
    status: c.status,
    unreadCount: c.unreadCount,
    lastMessageAt: c.lastMessageAt,
    lastMessage: c.messages[0]?.content ?? null,
    lastDirection: c.messages[0]?.direction ?? null,
  }));
  // Konteks untuk layar kosong. "Belum ada percakapan" punya dua arti yang
  // sangat berbeda — belum ada yang membalas, atau balasannya tidak sampai —
  // dan sebelumnya layarnya selalu menebak arti yang pertama.
  const [connectedAccounts, sentOutbound] = await Promise.all([
    prisma.messagingAccount.count({ where: { workspaceId: session.workspace.id, status: "CONNECTED" } }),
    prisma.outboundDelivery.count({ where: { workspaceId: session.workspace.id, channel: "WHATSAPP", status: "SENT" } }),
  ]);

  return NextResponse.json({ success: true, data, meta: { connectedAccounts, sentOutbound } });
}

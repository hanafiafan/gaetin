import { prisma } from "@/lib/db/prisma";
import { normalizePhone } from "@/lib/utils";
import { isOptOut } from "@/lib/contacts/dnc";

/** Persist the message, unread count, reply cancellation and opt-out atomically. */
export async function handleIncomingMessage(accountId: string, rawPhone: string, text: string, waMessageId?: string, occurredAt = new Date()) {
  const phone = normalizePhone(rawPhone);
  if (!phone || !waMessageId) throw new Error("INVALID_INCOMING_MESSAGE");
  await prisma.$transaction(async (tx) => {
    const account = await tx.messagingAccount.findUnique({ where: { id: accountId } });
    if (!account) return; // deleted accounts need no further retries
    const workspaceId = account.workspaceId;
    await tx.$queryRaw`SELECT id FROM "Workspace" WHERE id = ${workspaceId} FOR UPDATE`;
    const duplicate = await tx.inboxMessage.findFirst({ where: { waMessageId, conversation: { workspaceId, messagingAccountId: accountId } } });
    if (duplicate) return;
    const contact = await tx.contact.upsert({ where: { workspaceId_phone: { workspaceId, phone } }, update: {}, create: { workspaceId, phone, source: "INBOUND" } });
    if (!contact.lastInboundAt || contact.lastInboundAt < occurredAt) await tx.contact.update({ where: { id: contact.id }, data: { lastInboundAt: occurredAt, lastContacted: occurredAt } });
    const convo = await tx.conversation.upsert({
      where: { workspaceId_contactId_messagingAccountId: { workspaceId, contactId: contact.id, messagingAccountId: accountId } },
      update: { unreadCount: { increment: 1 }, status: "OPEN" },
      create: { workspaceId, contactId: contact.id, messagingAccountId: accountId, lastMessageAt: occurredAt, unreadCount: 1 },
    });
    if (convo.lastMessageAt < occurredAt) await tx.conversation.update({ where: { id: convo.id }, data: { lastMessageAt: occurredAt } });
    await tx.inboxMessage.create({ data: { conversationId: convo.id, direction: "INBOUND", content: text, waMessageId, status: "DELIVERED", createdAt: occurredAt } });
    await tx.followUpSchedule.updateMany({ where: { contactId: contact.id, status: "SCHEDULED", OR: [{ outboundAt: null }, { outboundAt: { lte: occurredAt } }] }, data: { status: "STOPPED_REPLIED" } });
    if (isOptOut(text)) await tx.doNotContact.upsert({ where: { workspaceId_phone: { workspaceId, phone } }, update: {}, create: { workspaceId, phone, reason: "OPT_OUT" } });
  });
}

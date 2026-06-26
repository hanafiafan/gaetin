import { prisma } from "@/lib/db/prisma";
import { normalizePhone } from "@/lib/utils";
import { isOptOut, addToDnc } from "@/lib/contacts/dnc";

/**
 * Tangani pesan WhatsApp masuk: simpan ke Conversation/InboxMessage,
 * hentikan rangkaian follow-up (Req 9.5), dan proses opt-out otomatis.
 * Dipanggil dari listener Baileys (messages.upsert).
 */
export async function handleIncomingMessage(
  accountId: string,
  rawPhone: string,
  text: string,
  waMessageId?: string,
): Promise<void> {
  const account = await prisma.messagingAccount.findUnique({
    where: { id: accountId },
    select: { workspaceId: true },
  });
  if (!account) return;
  const workspaceId = account.workspaceId;
  const phone = normalizePhone(rawPhone);
  if (!phone) return;

  // Kontak (buat jika baru, sumber INBOUND).
  const contact = await prisma.contact.upsert({
    where: { workspaceId_phone: { workspaceId, phone } },
    update: { lastContacted: new Date() },
    create: { workspaceId, phone, source: "INBOUND" },
  });

  // Percakapan (satu per kontak per nomor pengirim).
  const convo = await prisma.conversation.upsert({
    where: {
      workspaceId_contactId_messagingAccountId: {
        workspaceId,
        contactId: contact.id,
        messagingAccountId: accountId,
      },
    },
    update: { lastMessageAt: new Date(), unreadCount: { increment: 1 }, status: "OPEN" },
    create: {
      workspaceId,
      contactId: contact.id,
      messagingAccountId: accountId,
      lastMessageAt: new Date(),
      unreadCount: 1,
      status: "OPEN",
    },
  });

  await prisma.inboxMessage.create({
    data: {
      conversationId: convo.id,
      direction: "INBOUND",
      content: text,
      waMessageId,
      status: "DELIVERED",
    },
  });

  // Balasan masuk apa pun menghentikan rangkaian follow-up terjadwal.
  await prisma.followUpSchedule
    .updateMany({
      where: { contactId: contact.id, status: "SCHEDULED" },
      data: { status: "STOPPED_REPLIED" },
    })
    .catch(() => undefined);

  // Opt-out: masukkan ke Do-Not-Contact.
  if (isOptOut(text)) {
    await addToDnc(workspaceId, phone, "OPT_OUT").catch(() => undefined);
  }
}

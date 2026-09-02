import { prisma } from "@/lib/db/prisma";
import { sendEmail, isEmailConfigured } from "@/lib/email/service";
import { renderMessage } from "@/lib/messaging/text";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
// Jeda ringan antar email — bukan anti-ban (beda karakter risiko dari WA),
// cuma supaya tidak menghajar rate limit provider email.
function sendDelay() {
  return 300 + Math.random() * 400;
}

async function emailBlastStopped(id: string): Promise<boolean> {
  const b = await prisma.emailBlast.findUnique({ where: { id }, select: { status: true } });
  return b?.status === "STOPPED";
}

export async function runEmailBlast(emailBlastId: string): Promise<void> {
  let sentCount = 0;
  let failedCount = 0;

  try {
    const blast = await prisma.emailBlast.findUnique({ where: { id: emailBlastId } });
    if (!blast) return;
    sentCount = blast.sentCount;
    failedCount = blast.failedCount;

    if (!(await isEmailConfigured())) {
      await prisma.emailBlast.update({ where: { id: emailBlastId }, data: { status: "FAILED" } });
      return;
    }

    const messages = await prisma.emailBlastMessage.findMany({
      where: { emailBlastId, status: "PENDING" },
      include: { contact: true },
    });

    for (const m of messages) {
      if (await emailBlastStopped(emailBlastId)) break;
      if (!m.contact.email) {
        await prisma.emailBlastMessage.update({
          where: { id: m.id },
          data: { status: "FAILED", errorReason: "Kontak tidak punya email" },
        });
        failedCount += 1;
        await prisma.emailBlast.update({ where: { id: emailBlastId }, data: { failedCount } });
        continue;
      }

      const vars = { nama: m.contact.name, name: m.contact.name, kota: m.contact.city, phone: m.contact.phone };
      const subject = renderMessage(blast.subject, vars);
      const bodyHtml = renderMessage(blast.bodyText ?? "", vars).replace(/\n/g, "<br/>");

      const res = await sendEmail({ to: m.contact.email, subject, html: bodyHtml });
      if (res.ok) {
        await prisma.emailBlastMessage.update({
          where: { id: m.id },
          data: { status: "SENT", sentAt: new Date() },
        });
        sentCount += 1;
        await prisma.contact.update({ where: { id: m.contactId }, data: { lastContacted: new Date() } });
      } else {
        await prisma.emailBlastMessage.update({
          where: { id: m.id },
          data: { status: "FAILED", errorReason: res.error ?? "Gagal kirim" },
        });
        failedCount += 1;
      }

      await prisma.emailBlast.update({ where: { id: emailBlastId }, data: { sentCount, failedCount } });
      await delay(sendDelay());
    }

    const stopped = await emailBlastStopped(emailBlastId);
    await prisma.emailBlast.update({
      where: { id: emailBlastId },
      data: {
        status: stopped ? "STOPPED" : "COMPLETED",
        completedAt: new Date(),
        sentCount,
        failedCount,
      },
    });
  } catch {
    await prisma.emailBlast
      .update({ where: { id: emailBlastId }, data: { status: "FAILED", sentCount, failedCount } })
      .catch(() => undefined);
  }
}

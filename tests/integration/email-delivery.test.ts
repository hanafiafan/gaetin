import { afterAll, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
const send = vi.hoisted(() => vi.fn());
vi.mock("@/lib/email/service", () => ({ sendEmail: send }));
import { runEmailBlast } from "@/lib/email-blast/service";
import { CREDIT_COSTS } from "@/config/plans";
const ids: string[] = [];
afterAll(async () => {
  await prisma.creditLedger.deleteMany({ where: { workspaceId: { in: ids } } });
  await prisma.outboundDelivery.deleteMany({ where: { workspaceId: { in: ids } } });
  await prisma.workspace.deleteMany({ where: { id: { in: ids } } });
  await prisma.$disconnect();
});
it.each([
  { result: { ok: true }, status: "SENT", charged: true },
  { result: { ok: false, error: "Rejected" }, status: "FAILED", charged: false },
  { result: { ok: false, uncertain: true, error: "Timeout" }, status: "UNKNOWN", charged: true },
])("does not resend or charge twice after provider result $status", async ({ result, status, charged }) => {
  send.mockReset().mockResolvedValue(result);
  const ws = await prisma.workspace.create({ data: { name: "email-regression", slug: randomUUID(), credits: 100 } }); ids.push(ws.id);
  const contact = await prisma.contact.create({ data: { workspaceId: ws.id, phone: "628111111111", email: "test@example.test" } });
  const blast = await prisma.emailBlast.create({ data: { workspaceId: ws.id, name: "test", subject: "Hello", bodyText: "Hello", status: "RUNNING" } });
  const message = await prisma.emailBlastMessage.create({ data: { emailBlastId: blast.id, contactId: contact.id } });
  await runEmailBlast(blast.id);
  // Simulate a crash after receipt persistence but before updating the message.
  await prisma.emailBlastMessage.update({ where: { id: message.id }, data: { status: "PENDING" } });
  await prisma.emailBlast.update({ where: { id: blast.id }, data: { status: "RUNNING" } });
  await runEmailBlast(blast.id);
  expect(send).toHaveBeenCalledOnce();
  expect((await prisma.outboundDelivery.findUniqueOrThrow({ where: { id: `EMAIL_BLAST:${message.id}` } })).status).toBe(status);
  expect((await prisma.workspace.findUniqueOrThrow({ where: { id: ws.id } })).credits).toBe(100 - (charged ? CREDIT_COSTS.sendEmail : 0));
});

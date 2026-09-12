import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db/prisma";
import { handlePaidTransaction } from "@/lib/billing/service";
import { startSendJob, enqueue, scheduleDueJobs } from "@/lib/jobs/queue";
import { handleIncomingMessage } from "@/lib/inbox/service";
import { processFollowUps } from "@/lib/followup/service";
import { deliverWhatsApp } from "@/lib/messaging/delivery";
import { runCampaign } from "@/lib/campaign/service";
import { rateLimit } from "@/lib/rate-limit";
import { getWorkspacePlan } from "@/lib/plans/limits";

const send = vi.hoisted(() => vi.fn());
vi.mock("@/lib/messaging/provider", () => ({ getMessagingProvider: () => ({ sendMessage: send }) }));
const ids: string[] = [];
async function workspace(credits = 100) {
  const ws = await prisma.workspace.create({ data: { name: "reliability-test", slug: randomUUID(), credits, subscription: { create: { plan: "GROWTH", status: "ACTIVE", currentPeriodEnd: new Date(Date.now() + 30 * 86400000) } } } });
  ids.push(ws.id); return ws;
}
async function recipient(workspaceId: string) {
  const contact = await prisma.contact.create({ data: { workspaceId, phone: "628123456789" } });
  const account = await prisma.messagingAccount.create({ data: { workspaceId, label: "test", status: "CONNECTED", dailyLimit: 100 } });
  return { contact, account };
}
beforeAll(async () => { await prisma.$queryRaw`SELECT 1`; });
afterAll(async () => {
  await prisma.creditLedger.deleteMany({ where: { workspaceId: { in: ids } } });
  await prisma.backgroundJob.deleteMany({ where: { workspaceId: { in: ids } } });
  await prisma.outboundDelivery.deleteMany({ where: { workspaceId: { in: ids } } });
  await prisma.workspace.deleteMany({ where: { id: { in: ids } } });
  await prisma.$disconnect();
});

describe("billing settlement", () => {
  it("grants a concurrent repeated top-up exactly once and validates amount", async () => {
    const ws = await workspace(); const orderId = randomUUID();
    await prisma.transaction.create({ data: { workspaceId: ws.id, orderId, kind: "TOPUP", credits: 25, grossAmount: 1000 } });
    await expect(handlePaidTransaction(orderId, "1")).rejects.toThrow("AMOUNT_MISMATCH");
    await Promise.all(Array.from({ length: 10 }, () => handlePaidTransaction(orderId, "1000.00")));
    expect((await prisma.workspace.findUniqueOrThrow({ where: { id: ws.id } })).credits).toBe(125);
    expect(await prisma.creditLedger.count({ where: { workspaceId: ws.id, reason: "TOPUP" } })).toBe(1);
  });
  it("rolls back activation on a credit failure and grants the retried invoice", async () => {
    const ws = await workspace(); const orderId = randomUUID();
    const before = await prisma.subscription.findUniqueOrThrow({ where: { workspaceId: ws.id } });
    await prisma.transaction.create({ data: { workspaceId: ws.id, orderId, plan: "GROWTH", allocationCredits: -1, grossAmount: 1000 } });
    await expect(handlePaidTransaction(orderId)).rejects.toThrow("INVALID_CREDIT_AMOUNT");
    expect((await prisma.transaction.findUniqueOrThrow({ where: { orderId } })).status).toBe("PENDING");
    expect((await prisma.subscription.findUniqueOrThrow({ where: { workspaceId: ws.id } })).currentPeriodEnd).toEqual(before.currentPeriodEnd);
    await prisma.transaction.update({ where: { orderId }, data: { allocationCredits: 50 } });
    await handlePaidTransaction(orderId);
    expect((await prisma.workspace.findUniqueOrThrow({ where: { id: ws.id } })).credits).toBe(150);
    const renewed = await prisma.subscription.findUniqueOrThrow({ where: { workspaceId: ws.id } });
    expect(renewed.currentPeriodEnd!.getTime()).toBeGreaterThan(before.currentPeriodEnd!.getTime() + 27 * 86400000);
  });
});

describe("queue and delivery", () => {
  it("accepts only one concurrent execution and preserves requeue generations", async () => {
    const ws = await workspace(); const c = await prisma.campaign.create({ data: { workspaceId: ws.id, name: "test", messageTemplate: "hello" } });
    const starts = await Promise.all(Array.from({ length: 10 }, () => startSendJob("CAMPAIGN", c.id, ws.id)));
    expect(starts.filter(Boolean)).toHaveLength(1);
    const job = await prisma.backgroundJob.findUniqueOrThrow({ where: { id: `CAMPAIGN:${c.id}` } });
    await prisma.$transaction((tx) => enqueue(tx, "CAMPAIGN", c.id, ws.id));
    expect((await prisma.backgroundJob.updateMany({ where: { id: job.id, generation: job.generation }, data: { status: "DONE" } })).count).toBe(0);
  });
  it("schedules only due campaigns", async () => {
    const ws = await workspace();
    const due = await prisma.campaign.create({ data: { workspaceId: ws.id, name: "due", messageTemplate: "hi", status: "SCHEDULED", scheduledAt: new Date(Date.now() - 1000) } });
    const later = await prisma.campaign.create({ data: { workspaceId: ws.id, name: "later", messageTemplate: "hi", status: "SCHEDULED", scheduledAt: new Date(Date.now() + 86400000) } });
    await scheduleDueJobs();
    expect((await prisma.campaign.findUniqueOrThrow({ where: { id: due.id } })).status).toBe("ACTIVE");
    expect(await prisma.backgroundJob.findUnique({ where: { id: `CAMPAIGN:${later.id}` } })).toBeNull();
  });
  it("recovers a transient send failure without charging twice", async () => {
    const ws = await workspace(); const { contact, account } = await recipient(ws.id);
    const input = { id: randomUUID(), workspaceId: ws.id, accountId: account.id, contactId: contact.id, text: "test" };
    send.mockResolvedValueOnce({ ok: false, retryable: true, error: "timeout" }).mockResolvedValueOnce({ ok: true, waMessageId: "receipt" });
    await expect(deliverWhatsApp(input)).rejects.toThrow("timeout");
    await deliverWhatsApp(input); await deliverWhatsApp(input);
    expect(await prisma.creditLedger.count({ where: { workspaceId: ws.id, reason: "SEND_WHATSAPP" } })).toBe(1);
    expect((await prisma.messagingAccount.findUniqueOrThrow({ where: { id: account.id } })).sentToday).toBe(1);
  });
  it("reserves the last quota slot atomically and rejects cross-workspace recipients", async () => {
    const ws = await workspace(); const other = await workspace(); const { contact, account } = await recipient(ws.id);
    await prisma.messagingAccount.update({ where: { id: account.id }, data: { dailyLimit: 1 } });
    send.mockResolvedValue({ ok: true, waMessageId: "receipt" });
    const results = await Promise.allSettled([1, 2].map(() => deliverWhatsApp({ id: randomUUID(), workspaceId: ws.id, accountId: account.id, contactId: contact.id, text: "test" })));
    expect(results.filter((x) => x.status === "fulfilled")).toHaveLength(1);
    await expect(deliverWhatsApp({ id: randomUUID(), workspaceId: other.id, accountId: account.id, contactId: contact.id, text: "test" })).rejects.toThrow("tidak tersedia");
  });
  it("refunds a definite rejection once, but never retries an uncertain send", async () => {
    const ws = await workspace(); const { contact, account } = await recipient(ws.id);
    const base = { workspaceId: ws.id, accountId: account.id, contactId: contact.id, text: "test" };
    send.mockReset().mockResolvedValueOnce({ ok: false, error: "rejected" }).mockResolvedValueOnce({ ok: false, uncertain: true, error: "unknown" });
    const first = { ...base, id: randomUUID() }; await deliverWhatsApp(first); await deliverWhatsApp(first);
    const second = { ...base, id: randomUUID() }; await deliverWhatsApp(second); await deliverWhatsApp(second);
    expect(send).toHaveBeenCalledTimes(2);
    expect(await prisma.creditLedger.count({ where: { workspaceId: ws.id, reason: "REFUND_SEND_WHATSAPP" } })).toBe(1);
  });
  it("reconstructs counters from recipient rows after a resumed campaign", async () => {
    const ws = await workspace(); const { contact, account } = await recipient(ws.id);
    const c = await prisma.campaign.create({ data: { workspaceId: ws.id, name: "resume", accountId: account.id, messageTemplate: "hi", status: "ACTIVE", messages: { create: { contactId: contact.id, status: "SENT", sentAt: new Date() } } } });
    await runCampaign(c.id);
    expect(await prisma.campaign.findUnique({ where: { id: c.id } })).toMatchObject({ status: "COMPLETED", sentCount: 1 });
  });
});

describe("inbox and follow-up", () => {
  it("deduplicates inbound retries and atomically applies opt-out and cancellation", async () => {
    const ws = await workspace(); const { contact, account } = await recipient(ws.id);
    const old = new Date(Date.now() - 5 * 86400000);
    await prisma.contact.update({ where: { id: contact.id }, data: { lastOutboundAt: old } });
    const rule = await prisma.followUpRule.create({ data: { workspaceId: ws.id, name: "rule", triggerType: "NO_REPLY_DAYS", triggerValue: { accountId: account.id, days: 3 }, messageTemplate: "hello", schedules: { create: { contactId: contact.id, scheduledAt: new Date(), outboundAt: old } } } });
    await Promise.all(Array.from({ length: 5 }, () => handleIncomingMessage(account.id, contact.phone, "STOP", "same-message")));
    const convo = await prisma.conversation.findFirstOrThrow({ where: { workspaceId: ws.id } });
    expect(convo.unreadCount).toBe(1);
    expect(await prisma.inboxMessage.count({ where: { conversationId: convo.id } })).toBe(1);
    expect(await prisma.doNotContact.count({ where: { workspaceId: ws.id } })).toBe(1);
    expect((await prisma.followUpSchedule.findFirstOrThrow({ where: { ruleId: rule.id } })).status).toBe("STOPPED_REPLIED");
    expect((await processFollowUps(ws.id)).sent).toBe(0);
  });
  it("ignores untouched contacts, charges follow-up once and does not trigger itself again", async () => {
    const ws = await workspace(); const { contact, account } = await recipient(ws.id);
    await prisma.followUpRule.create({ data: { workspaceId: ws.id, name: "rule", triggerType: "NO_REPLY_DAYS", triggerValue: { accountId: account.id, days: 3 }, messageTemplate: "hello" } });
    expect((await processFollowUps(ws.id)).generated).toBe(0);
    const origin = new Date(Date.now() - 5 * 86400000);
    await prisma.contact.update({ where: { id: contact.id }, data: { lastOutboundAt: origin } });
    send.mockReset().mockResolvedValue({ ok: true, waMessageId: "followup" });
    expect(await processFollowUps(ws.id)).toMatchObject({ generated: 1, sent: 1 });
    expect(await processFollowUps(ws.id)).toMatchObject({ generated: 0, sent: 0 });
    expect((await prisma.contact.findUniqueOrThrow({ where: { id: contact.id } })).lastOutboundAt).toEqual(origin);
    expect(await prisma.creditLedger.count({ where: { workspaceId: ws.id, reason: "SEND_WHATSAPP" } })).toBe(1);
  });
});

it("enforces shared concurrent rate limits", async () => {
  const results = await Promise.all(Array.from({ length: 15 }, () => rateLimit("test:" + ids[0], 5, 60000)));
  expect(results.filter((x) => x.ok)).toHaveLength(5);
});
it("downgrades expired subscriptions for server-side limits", async () => {
  const ws = await workspace();
  await prisma.subscription.update({ where: { workspaceId: ws.id }, data: { currentPeriodEnd: new Date(0) } });
  expect((await getWorkspacePlan(ws.id)).id).toBe("STARTER");
});

it("reconciles an operator-confirmed failure with one refund and one audit event", async () => {
  const { reconcileDelivery } = await import("@/lib/messaging/reconcile");
  const ws = await workspace(); const { contact, account } = await recipient(ws.id);
  const id = randomUUID();
  await prisma.outboundDelivery.create({ data: { id, workspaceId: ws.id, accountId: account.id, contactId: contact.id, channel: "WHATSAPP", status: "UNKNOWN", cost: 2, updatedAt: new Date(Date.now() - 600000) } });
  await Promise.all([1, 2].map(() => reconcileDelivery(id, "FAILED", "test-operator", "Confirmed not sent at provider")));
  expect((await prisma.workspace.findUniqueOrThrow({ where: { id: ws.id } })).credits).toBe(102);
  expect(await prisma.auditLog.count({ where: { workspaceId: ws.id, action: "DELIVERY_RECONCILED" } })).toBe(1);
  await prisma.auditLog.deleteMany({ where: { workspaceId: ws.id } });
});

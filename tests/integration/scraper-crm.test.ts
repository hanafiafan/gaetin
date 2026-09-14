import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
const auth = vi.hoisted(() => ({ workspaceId: "" }));
vi.mock("@/lib/auth/session", () => ({ getSession: async () => ({ workspace: { id: auth.workspaceId }, user: { id: "test" } }) }));
vi.mock("@/lib/plans/limits", () => ({ getWorkspacePlan: async () => ({ id: "GROWTH", name: "Test", limits: { scraperMaxResultsPerJob: 3, scraperJobsPerMonth: 4 } }), monthStart: () => new Date(0) }));
vi.mock("@/lib/auth/entitlements", () => ({ featureDenied: async () => null }));
import { POST as ingest } from "@/app/api/scraper/extension/route";
import { POST as createCard } from "@/app/api/crm/cards/route";
import { POST as startScraper } from "@/app/api/scraper/start/route";
import { PUT as moveCard, DELETE as deleteCard } from "@/app/api/crm/cards/[id]/route";
import { addContactToFirstPipelineStage } from "@/lib/crm/pipeline";

const request = (body: unknown) => new NextRequest("http://localhost/api/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
beforeAll(async () => {
  const ws = await prisma.workspace.create({ data: { name: "regression", slug: randomUUID() } });
  auth.workspaceId = ws.id;
});
afterAll(async () => {
  await prisma.workspace.delete({ where: { id: auth.workspaceId } });
  await prisma.$disconnect();
});
describe("scraper ingest", () => {
  it("serializes parallel batches and enforces the total job quota", async () => {
    const job = await prisma.scraperJob.create({ data: { workspaceId: auth.workspaceId, keyword: "test" } });
    const replies = await Promise.all(Array.from({ length: 6 }, (_, i) => ingest(request({ jobId: job.id, leads: [{ businessName: "Business " + i, address: "Address " + i }] }))));
    expect(replies.every((r) => r.status === 200)).toBe(true);
    expect(await prisma.lead.count({ where: { scraperJobId: job.id } })).toBe(3);
    expect((await prisma.scraperJob.findUniqueOrThrow({ where: { id: job.id } })).totalFound).toBe(3);
  });
  it("rejects the entire malformed batch without partial inserts", async () => {
    const job = await prisma.scraperJob.create({ data: { workspaceId: auth.workspaceId, keyword: "test" } });
    expect((await ingest(request({ jobId: job.id, leads: [{ businessName: "Valid" }, { businessName: "Bad", phone: {} }] }))).status).toBe(400);
    expect(await prisma.lead.count({ where: { scraperJobId: job.id } })).toBe(0);
    expect((await ingest(request({ jobId: job.id, leads: [], isFinished: "false" }))).status).toBe(400);
  });
  it("preserves same-name branches and deduplicates repeated sends", async () => {
    const job = await prisma.scraperJob.create({ data: { workspaceId: auth.workspaceId, keyword: "test" } });
    const leads = [{ businessName: "Cafe", address: "Jakarta" }, { businessName: "Cafe", address: "Bandung" }];
    await Promise.all([ingest(request({ jobId: job.id, leads })), ingest(request({ jobId: job.id, leads }))]);
    expect(await prisma.lead.count({ where: { scraperJobId: job.id } })).toBe(2);
    expect((await ingest(request({ jobId: job.id, leads: [], isFinished: true }))).status).toBe(200);
    expect((await ingest(request({ jobId: job.id, leads: [], isFinished: true }))).status).toBe(200);
    expect((await ingest(request({ jobId: job.id, leads }))).status).toBe(409);
  });
});
it("enforces the monthly scraper limit during concurrent starts", async () => {
  const before = await prisma.scraperJob.count({ where: { workspaceId: auth.workspaceId } });
  const replies = await Promise.all(Array.from({ length: 5 }, () => startScraper(request({ keyword: "Cafe", location: "Jakarta" }))));
  expect(replies.filter((r) => r.status === 202)).toHaveLength(4 - before);
  expect(await prisma.scraperJob.count({ where: { workspaceId: auth.workspaceId } })).toBe(4);
});
describe("CRM concurrent mutations", () => {
  it("creates one default pipeline and one card for concurrent automatic additions", async () => {
    const contact = await prisma.contact.create({ data: { workspaceId: auth.workspaceId, phone: "628111111111" } });
    const results = await Promise.all(Array.from({ length: 5 }, () => addContactToFirstPipelineStage(auth.workspaceId, contact.id)));
    expect(results.filter((r) => r.added)).toHaveLength(1);
    expect(await prisma.pipeline.count({ where: { workspaceId: auth.workspaceId } })).toBe(1);
  });
  it("prevents duplicate manual cards and keeps contact stage consistent with concurrent moves", async () => {
    const contact = await prisma.contact.create({ data: { workspaceId: auth.workspaceId, phone: "628222222222" } });
    const pipeline = await prisma.pipeline.findFirstOrThrow({ where: { workspaceId: auth.workspaceId }, include: { columns: true } });
    const replies = await Promise.all(Array.from({ length: 5 }, () => createCard(request({ contactId: contact.id, columnId: pipeline.columns[0].id }))));
    expect(replies.filter((r) => r.status === 201)).toHaveLength(1);
    expect(replies.filter((r) => r.status === 409)).toHaveLength(4);
    const card = await prisma.pipelineCard.findFirstOrThrow({ where: { contactId: contact.id } });
    await Promise.all(pipeline.columns.map((column) => moveCard(request({ columnId: column.id }), { params: Promise.resolve({ id: card.id }) })));
    const updated = await prisma.pipelineCard.findUniqueOrThrow({ where: { id: card.id }, include: { column: true, contact: true } });
    expect(updated.contact.crmStage).toBe(updated.column.name);
    expect((await deleteCard(request({}), { params: Promise.resolve({ id: card.id }) })).status).toBe(200);
    expect((await prisma.contact.findUniqueOrThrow({ where: { id: contact.id } })).crmStage).toBeNull();
  });
});

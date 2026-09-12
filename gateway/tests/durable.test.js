const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { createReceiptStore, createWebhookOutbox } = require("../durable");

test("concurrent and restarted requests send once; changed payload is rejected", async () => {
 const dir = await fs.mkdtemp(path.join(os.tmpdir(), "gaetin-receipts-"));
 try {
  const once = createReceiptStore(dir); let sends = 0;
  const send = async () => { sends++; await new Promise(r => setTimeout(r, 10)); return "wa-id"; };
  const results = await Promise.all(Array.from({ length: 10 }, () => once("key", { text: "hello" }, send)));
  assert.equal(sends, 1); assert.ok(results.every(r => r.waMessageId === "wa-id"));
  assert.equal((await createReceiptStore(dir)("key", { text: "hello" }, send)).waMessageId, "wa-id");
  assert.equal((await once("key", { text: "changed" }, send)).error, "IDEMPOTENCY_CONFLICT");
  assert.equal(sends, 1);
 } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
test("a pending receipt from a crashed process is never resent", async () => {
 const dir = await fs.mkdtemp(path.join(os.tmpdir(), "gaetin-pending-"));
 try {
  const once = createReceiptStore(dir); let entered; const started = new Promise(r => { entered = r; });
  void once("key", { text: "hello" }, () => { entered(); return new Promise(() => {}); });
  await started;
  let sent = false;
  const result = await createReceiptStore(dir)("key", { text: "hello" }, async () => { sent = true; });
  assert.equal(result.uncertain, true); assert.equal(sent, false);
 } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
test("failed webhooks remain on disk and are replayed after restart", async () => {
 const dir = await fs.mkdtemp(path.join(os.tmpdir(), "gaetin-outbox-"));
 try {
  const outbox = createWebhookOutbox(dir, async () => { throw new Error("offline"); });
  await outbox.enqueue({ event: "message", msgId: "m1" });
  await new Promise(r => setTimeout(r, 30));
  assert.equal((await fs.readdir(dir)).filter(f => f.endsWith(".json")).length, 1);
  const delivered = [];
  await createWebhookOutbox(dir, async p => delivered.push(p)).flush();
  assert.equal(delivered[0].msgId, "m1"); assert.equal((await fs.readdir(dir)).length, 0);
 } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

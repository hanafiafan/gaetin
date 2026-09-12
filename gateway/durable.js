const fs = require("fs/promises");
const path = require("path");
const { createHash, randomUUID } = require("crypto");

async function writeDurably(filename, value, exclusive = false) {
  const target = exclusive ? filename : `${filename}.${randomUUID()}.tmp`;
  const handle = await fs.open(target, exclusive ? "wx" : "w", 0o600);
  try { await handle.writeFile(JSON.stringify(value)); await handle.sync(); } finally { await handle.close(); }
  if (!exclusive) await fs.rename(target, filename);
}

function createReceiptStore(directory) {
  const inFlight = new Map();
  async function execute(key, payload, send) {
    const fingerprint = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    const filename = path.join(directory, `${createHash("sha256").update(key).digest("hex")}.json`);
    await fs.mkdir(directory, { recursive: true });
    let existing;
    try { existing = JSON.parse(await fs.readFile(filename, "utf8")); } catch (err) { if (err.code !== "ENOENT") throw err; }
    if (existing) {
      if (existing.fingerprint !== fingerprint) return { ok: false, uncertain: true, error: "IDEMPOTENCY_CONFLICT" };
      return existing.result ?? { ok: false, uncertain: true, error: "DELIVERY_UNKNOWN: gateway restarted during send; inspect WhatsApp before retrying" };
    }
    // A pending receipt is persisted BEFORE touching WhatsApp. Never resend an ambiguous attempt.
    await writeDurably(filename, { fingerprint }, true);
    let result;
    try { result = { ok: true, waMessageId: await send() }; }
    catch (err) { result = { ok: false, uncertain: !err.definitive, error: err.definitive ? err.message : `DELIVERY_UNKNOWN: ${err.message}` }; }
    await writeDurably(filename, { fingerprint, result });
    return result;
  }
  return async (key, payload, send) => {
    const fingerprint = JSON.stringify(payload);
    const current = inFlight.get(key);
    if (current) return current.fingerprint === fingerprint ? current.promise : { ok: false, uncertain: true, error: "IDEMPOTENCY_CONFLICT" };
    const promise = execute(key, payload, send).finally(() => inFlight.delete(key));
    inFlight.set(key, { fingerprint, promise });
    return promise;
  };
}

function createWebhookOutbox(directory, deliver) {
  let flushing = false;
  async function flush() {
    if (flushing) return;
    flushing = true;
    try {
      await fs.mkdir(directory, { recursive: true });
      const files = (await fs.readdir(directory)).filter((f) => f.endsWith(".json")).sort();
      for (const file of files) {
        const filename = path.join(directory, file);
        const payload = JSON.parse(await fs.readFile(filename, "utf8"));
        try { await deliver(payload); await fs.unlink(filename); }
        catch (err) { console.error("Webhook pending retry:", err.message); break; }
      }
    } finally { flushing = false; }
  }
  return {
    flush,
    async enqueue(payload) {
      await fs.mkdir(directory, { recursive: true });
      const event = { ...payload, eventId: randomUUID(), occurredAt: new Date().toISOString() };
      await writeDurably(path.join(directory, `${Date.now()}-${event.eventId}.json`), event);
      void flush().catch((err) => console.error("Webhook outbox failure:", err.message));
    },
  };
}
module.exports = { createReceiptStore, createWebhookOutbox };

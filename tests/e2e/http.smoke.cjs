const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { createServer } = require("node:http");
const { randomUUID, createHash } = require("node:crypto");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
if (!process.env.TEST_DATABASE_URL) throw new Error("An isolated TEST_DATABASE_URL is required");
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
const workspaces = [], users = [], children = [], receipts = new Map();
let gateway;
let logs = "";
async function main() {
  gateway = createServer(async (req, res) => {
    let body = ""; for await (const chunk of req) body += chunk;
    const input = JSON.parse(body || "{}");
    if (req.url === "/send") {
      if (!receipts.has(input.idempotencyKey)) receipts.set(input.idempotencyKey, { ok: true, waMessageId: randomUUID() });
      res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(receipts.get(input.idempotencyKey)));
    } else { res.statusCode = 404; res.end(); }
  });
  await new Promise(r => gateway.listen(0, "127.0.0.1", r));
  const env = { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL, NODE_ENV: "production", JWT_SECRET: "http-smoke-jwt-secret-long-enough", MIDTRANS_SERVER_KEY: "http-smoke-midtrans-key", MIDTRANS_IS_PRODUCTION: "false", WEBHOOK_SECRET: "http-smoke-webhook", WA_GATEWAY_TOKEN: "http-smoke-gateway", WA_GATEWAY_BASE_URL: `http://127.0.0.1:${gateway.address().port}`, WA_PROVIDER: "gateway", ADMIN_HOSTS: "", ADMIN_PRIMARY_URL: "", ADMIN_ENTRY_PATH: "" };
  function launch(args) {
    const child = spawn(process.execPath, args, { env, stdio: ["ignore", "pipe", "pipe"] }); children.push(child);
    child.stdout.on("data", b => { logs = (logs + b).slice(-10000); }); child.stderr.on("data", b => { logs = (logs + b).slice(-10000); }); return child;
  }
  const app = launch(["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "55440"]);
  const base = "http://127.0.0.1:55440";
  let up = false;
  for (let i = 0; i < 100 && app.exitCode === null; i++) {
    try { if ((await fetch(`${base}/api/health`)).ok) { up = true; break; } } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  assert.ok(up, logs);
  async function fixture() {
    const ws = await db.workspace.create({ data: { name: "HTTP smoke", slug: randomUUID(), credits: 100, subscription: { create: { plan: "GROWTH", status: "ACTIVE", currentPeriodEnd: new Date(Date.now() + 86400000) } } } }); workspaces.push(ws.id);
    const user = await db.user.create({ data: { email: `${randomUUID()}@gaetin.test`, name: "Smoke", passwordHash: await bcrypt.hash("Smoke1234!", 4), memberships: { create: { workspaceId: ws.id, role: "OWNER" } } } }); users.push(user.id);
    const account = await db.messagingAccount.create({ data: { workspaceId: ws.id, label: "mock", status: "CONNECTED" } });
    const contact = await db.contact.create({ data: { workspaceId: ws.id, phone: "628123456789", name: "Test recipient" } });
    return { ws, user, account, contact };
  }
  const own = await fixture(), foreign = await fixture();
  let cookie = "";
  async function request(path, options = {}) {
    return fetch(base + path, { redirect: "manual", ...options, headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}), ...options.headers } });
  }
  assert.equal((await request("/api/contacts")).status, 401);
  const loginPage = await request("/login", { headers: { Cookie: "hellens_token=invalid" } }); assert.equal(loginPage.status, 200);
  const login = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ email: own.user.email, password: "Smoke1234!" }) }); assert.equal(login.status, 200);
  cookie = login.headers.get("set-cookie").split(";")[0];
  assert.equal((await request("/api/auth/me")).status, 200);
  for (const page of ["/dashboard", "/dashboard/contacts", "/dashboard/campaigns", "/dashboard/inbox", "/dashboard/billing", "/dashboard/team"]) assert.equal((await request(page)).status, 200, page);
  const otherCampaign = await db.campaign.create({ data: { workspaceId: foreign.ws.id, name: "foreign", messageTemplate: "test" } });
  assert.equal((await request(`/api/campaigns/${otherCampaign.id}`)).status, 404);
  assert.equal((await request(`/api/campaigns/${otherCampaign.id}/execute`, { method: "POST" })).status, 404);
  assert.equal((await request("/api/admin/deliveries")).status, 403);
  const inbound = { event: "message", accountId: own.account.id, phone: own.contact.phone, text: "Hello", msgId: "http-smoke-inbound", occurredAt: new Date().toISOString() };
  assert.equal((await request("/api/whatsapp/webhook", { method: "POST", body: JSON.stringify(inbound) })).status, 403);
  for (let i = 0; i < 2; i++) assert.equal((await request("/api/whatsapp/webhook", { method: "POST", headers: { "x-webhook-secret": env.WEBHOOK_SECRET }, body: JSON.stringify(inbound) })).status, 200);
  const convo = await db.conversation.findFirstOrThrow({ where: { workspaceId: own.ws.id } }); assert.equal(convo.unreadCount, 1);
  const reply = { text: "Reply", clientRequestId: randomUUID() };
  for (let i = 0; i < 2; i++) assert.equal((await request(`/api/conversations/${convo.id}/messages`, { method: "POST", body: JSON.stringify(reply) })).status, 201);
  assert.equal(receipts.size, 1);
  const beforePayment = (await db.workspace.findUniqueOrThrow({ where: { id: own.ws.id } })).credits;
  const orderId = randomUUID();
  await db.transaction.create({ data: { workspaceId: own.ws.id, orderId, kind: "TOPUP", credits: 10, grossAmount: 1000 } });
  const payment = { order_id: orderId, status_code: "200", gross_amount: "1000.00", transaction_status: "settlement", signature_key: createHash("sha512").update(orderId + "200" + "1000.00" + env.MIDTRANS_SERVER_KEY).digest("hex") };
  for (let i = 0; i < 2; i++) assert.equal((await request("/api/webhooks/midtrans", { method: "POST", body: JSON.stringify(payment) })).status, 200);
  assert.equal((await db.workspace.findUniqueOrThrow({ where: { id: own.ws.id } })).credits, beforePayment + 10);
  const scheduled = await db.campaign.create({ data: { workspaceId: own.ws.id, accountId: own.account.id, name: "due", messageTemplate: "Scheduled", status: "SCHEDULED", scheduledAt: new Date(Date.now() - 1000), totalRecipients: 1, messages: { create: { contactId: own.contact.id } } } });
  launch(["--import", "tsx", "scripts/worker.ts"]);
  let status;
  for (let i = 0; i < 150; i++) {
    status = (await db.campaign.findUniqueOrThrow({ where: { id: scheduled.id } })).status;
    if (status === "COMPLETED") break;
    await new Promise(r => setTimeout(r, 100));
  }
  assert.equal(status, "COMPLETED", logs); assert.equal(receipts.size, 2);
  assert.equal((await request("/api/settings/password", { method: "PUT", body: JSON.stringify({ currentPassword: "Smoke1234!", newPassword: "Changed1234!" }) })).status, 200);
  assert.equal((await request("/api/auth/me")).status, 401);
  const relogin = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ email: own.user.email, password: "Changed1234!" }) }); assert.equal(relogin.status, 200);
  cookie = relogin.headers.get("set-cookie").split(";")[0];
  await db.subscription.update({ where: { workspaceId: own.ws.id }, data: { currentPeriodEnd: new Date(0) } });
  assert.equal((await request("/api/campaigns")).status, 403);
  console.log("PASS: production HTTP smoke — auth, 6 dashboard pages, tenant isolation, webhook deduplication, idempotent inbox, billing replay, scheduled worker, password revocation, expired-plan API access");
}
main().catch(err => { console.error(err); process.exitCode = 1; }).finally(async () => {
  for (const child of children) {
    child.kill("SIGTERM");
    await new Promise(resolve => { if (child.exitCode !== null) return resolve(); child.once("exit", resolve); setTimeout(() => { child.kill("SIGKILL"); resolve(); }, 3000).unref(); });
  }
  if (gateway) await new Promise(r => gateway.close(r));
  await db.backgroundJob.deleteMany({ where: { workspaceId: { in: workspaces } } });
  await db.outboundDelivery.deleteMany({ where: { workspaceId: { in: workspaces } } });
  await db.creditLedger.deleteMany({ where: { workspaceId: { in: workspaces } } });
  await db.auditLog.deleteMany({ where: { workspaceId: { in: workspaces } } });
  await db.workspace.deleteMany({ where: { id: { in: workspaces } } });
  await db.user.deleteMany({ where: { id: { in: users } } });
  await db.$disconnect();
});

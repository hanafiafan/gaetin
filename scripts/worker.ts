// Load .env before importing modules that validate configuration (container env wins).
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

async function main() {
  const { Client } = await import("pg");
  const { prisma } = await import("../src/lib/db/prisma");
  const { scheduleDueJobs } = await import("../src/lib/jobs/queue");
  const { runCampaign } = await import("../src/lib/campaign/service");
  const { runBlast } = await import("../src/lib/blast/service");
  const { runEmailBlast } = await import("../src/lib/email-blast/service");
  const { processFollowUps } = await import("../src/lib/followup/service");
  const { runScraperJob } = await import("../src/lib/scraper/service");
  const { runEmailFindJob } = await import("../src/lib/email-finder/service");
  const { runValidation } = await import("../src/lib/validator/service");
  const lock = new Client({ connectionString: process.env.DATABASE_URL, keepAlive: true });
  // Losing the lock connection must stop this process before another worker takes over.
  lock.on("error", (err) => { console.error("Worker lock lost", err.message); process.exit(1); });
  await lock.connect();
  const result = await lock.query("SELECT pg_try_advisory_lock(724601921) AS acquired");
  if (!result.rows[0].acquired) { await lock.end(); throw new Error("Another Gaetin worker is running"); }
  await prisma.backgroundJob.updateMany({ where: { status: "RUNNING" }, data: { status: "READY" } });
  const { writeFileSync } = await import("node:fs");
  writeFileSync("/tmp/gaetin-worker-health", "ready");
  const heartbeat = setInterval(() => writeFileSync("/tmp/gaetin-worker-health", "ready"), 10000);
  heartbeat.unref();
  const cleanup = setInterval(() => {
    void prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lt: new Date() } } }).catch(console.error);
    void prisma.invalidatedToken.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(console.error);
  }, 60_000);
  cleanup.unref();
  let stopping = false;
  process.on("SIGTERM", () => { stopping = true; });
  process.on("SIGINT", () => { stopping = true; });
  console.log("Gaetin worker ready");
  while (!stopping) {
    await scheduleDueJobs();
    const job = await prisma.backgroundJob.findFirst({ where: { status: "READY", runAt: { lte: new Date() } }, orderBy: { runAt: "asc" } });
    if (!job) { await new Promise((r) => setTimeout(r, 1000)); continue; }
    const claimed = await prisma.backgroundJob.updateMany({ where: { id: job.id, generation: job.generation, status: "READY" }, data: { status: "RUNNING", attempts: { increment: 1 } } });
    if (!claimed.count) continue;
    const p = job.payload as { id: string; accountId: string; source: "LEAD" | "CONTACT"; targetIds: string[] };
    try {
      switch (job.kind) {
        case "CAMPAIGN": await runCampaign(p.id); break;
        case "BLAST": await runBlast(p.id); break;
        case "EMAIL_BLAST": await runEmailBlast(p.id); break;
        case "FOLLOW_UP": await processFollowUps(job.workspaceId); break;
        case "SCRAPER": await runScraperJob(p.id); break;
        case "EMAIL_FIND": await runEmailFindJob(p.id, job.workspaceId, p.source, p.targetIds); break;
        case "VALIDATION": await runValidation(p.id, job.workspaceId, p.accountId, p.targetIds); break;
        default: throw new Error("Unknown job kind");
      }
      await prisma.backgroundJob.updateMany({ where: { id: job.id, generation: job.generation }, data: { status: "DONE", error: null } });
    } catch (err) {
      console.error("Job failed", job.id, err);
      if (job.attempts >= 4) {
        if (job.kind === "CAMPAIGN") await prisma.campaign.updateMany({ where: { id: p.id, status: "ACTIVE" }, data: { status: "PAUSED" } });
        if (job.kind === "BLAST") await prisma.blast.updateMany({ where: { id: p.id, status: "RUNNING" }, data: { status: "STOPPED" } });
        if (job.kind === "EMAIL_BLAST") await prisma.emailBlast.updateMany({ where: { id: p.id, status: "RUNNING" }, data: { status: "STOPPED" } });
        if (job.kind === "VALIDATION") await prisma.validationRun.updateMany({ where: { id: p.id, status: "running" }, data: { status: "stopped" } });
      }
      await prisma.backgroundJob.updateMany({ where: { id: job.id, generation: job.generation }, data: {
        status: job.attempts >= 4 ? "FAILED" : "READY", error: err instanceof Error ? err.message : "Unknown error",
        runAt: new Date(Date.now() + Math.min(300_000, 5000 * 2 ** job.attempts)),
      } });
    }
  }
  clearInterval(cleanup);
  clearInterval(heartbeat);
  await prisma.$disconnect();
  await lock.end();
}
main().catch((err) => { console.error(err); process.exit(1); });

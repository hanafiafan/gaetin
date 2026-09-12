import { it, expect } from "vitest";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { enqueue } from "@/lib/jobs/queue";

it("a real worker recovers a RUNNING job left by a terminated process", async () => {
  const id = randomUUID();
  const ws = await prisma.workspace.create({ data: { name: "worker-test", slug: randomUUID() } });
  await prisma.validationRun.create({ data: { id, workspaceId: ws.id, total: 0 } });
  await prisma.$transaction((tx) => enqueue(tx, "VALIDATION", id, ws.id, { id, accountId: "unused", targetIds: [] }));
  await prisma.backgroundJob.update({ where: { id: `VALIDATION:${id}` }, data: { status: "RUNNING" } });
  const child = spawn(process.execPath, ["--import", "tsx", "scripts/worker.ts"], {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL!, NODE_ENV: "test", JWT_SECRET: "worker-test-secret-long-enough" }, stdio: ["ignore", "pipe", "pipe"],
  });
  let logs = "";
  child.stdout.on("data", (chunk) => { logs += chunk; }); child.stderr.on("data", (chunk) => { logs += chunk; });
  try {
    const deadline = Date.now() + 12000;
    let status = "";
    while (Date.now() < deadline && child.exitCode === null) {
      status = (await prisma.validationRun.findUniqueOrThrow({ where: { id } })).status;
      if (status === "done") break;
      await new Promise((r) => setTimeout(r, 100));
    }
    expect(status, logs).toBe("done");
    expect(logs).toContain("Gaetin worker ready");
  } finally {
    child.kill("SIGTERM");
    await new Promise<void>((resolve) => { if (child.exitCode !== null) return resolve(); child.once("exit", () => resolve()); setTimeout(() => { child.kill("SIGKILL"); resolve(); }, 2500).unref(); });
    await prisma.backgroundJob.deleteMany({ where: { workspaceId: ws.id } });
    await prisma.validationRun.delete({ where: { id } });
    await prisma.workspace.delete({ where: { id: ws.id } });
  }
}, 20000);

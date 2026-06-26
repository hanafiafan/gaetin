import { prisma } from "@/lib/db/prisma";
import { getMessagingProvider } from "@/lib/messaging/provider";
import { deductCredits, InsufficientCreditsError } from "@/lib/credits/service";
import { CREDIT_COSTS } from "@/config/plans";

export interface ValidationJob {
  total: number;
  processed: number;
  active: number;
  inactive: number;
  unverified: number;
  status: "running" | "done" | "stopped";
}

// Tracker progress in-memory (single instance). Di produksi: pakai BullMQ + DB.
const g = globalThis as unknown as { __valJobs?: Map<string, ValidationJob> };
const jobs: Map<string, ValidationJob> = g.__valJobs ?? new Map();
if (!g.__valJobs) g.__valJobs = jobs;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function getValidation(id: string): ValidationJob | null {
  return jobs.get(id) ?? null;
}

export function stopValidation(id: string): void {
  const j = jobs.get(id);
  if (j) j.status = "stopped";
}

export async function runValidation(
  jobId: string,
  workspaceId: string,
  accountId: string,
  contactIds: string[],
): Promise<void> {
  const job: ValidationJob = {
    total: contactIds.length,
    processed: 0,
    active: 0,
    inactive: 0,
    unverified: 0,
    status: "running",
  };
  jobs.set(jobId, job);

  const provider = getMessagingProvider();

  for (const cid of contactIds) {
    if (job.status === "stopped") break;
    const c = await prisma.contact.findFirst({ where: { id: cid, workspaceId } });
    if (!c) {
      job.processed += 1;
      continue;
    }
    // Potong kredit per nomor; berhenti jika kredit habis.
    try {
      await deductCredits(workspaceId, CREDIT_COSTS.validateNumber, "VALIDATE");
    } catch (e) {
      if (e instanceof InsufficientCreditsError) {
        job.status = "stopped";
        break;
      }
      throw e;
    }
    try {
      const ok = await provider.isRegistered(accountId, c.phone);
      await prisma.contact.update({
        where: { id: c.id },
        data: { waStatus: ok ? "ACTIVE" : "INACTIVE" },
      });
      if (ok) job.active += 1;
      else job.inactive += 1;
    } catch {
      job.unverified += 1;
    }
    job.processed += 1;
    // Jeda acak 2-5 detik untuk menghindari rate limit (Req 7.4).
    await delay(2000 + Math.random() * 3000);
  }

  if (job.status !== "stopped") job.status = "done";
}

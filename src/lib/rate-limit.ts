import { prisma } from "@/lib/db/prisma";
import { createHash } from "crypto";
export interface RateResult { ok: boolean; retryAfter?: number }
/** Shared atomic fixed-window limiter; survives restarts and multiple app instances. */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateResult> {
  const id = createHash("sha256").update(key).digest("hex");
  const now = new Date();
  const reset = new Date(now.getTime() + windowMs);
  const [bucket] = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "RateLimitBucket" (id, count, "resetAt") VALUES (${id}, 1, ${reset})
    ON CONFLICT (id) DO UPDATE SET
      count = CASE WHEN "RateLimitBucket"."resetAt" <= ${now} THEN 1 ELSE "RateLimitBucket".count + 1 END,
      "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= ${now} THEN ${reset} ELSE "RateLimitBucket"."resetAt" END
    RETURNING count, "resetAt"`;
  return bucket.count <= limit ? { ok: true } : { ok: false, retryAfter: Math.ceil((bucket.resetAt.getTime() - now.getTime()) / 1000) };
}
export function clientIp(req: Request): string {
  // Only trust forwarding headers supplied/overwritten by the configured reverse proxy.
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

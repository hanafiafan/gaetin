// Rate limiter in-memory sederhana (fixed window). Untuk produksi multi-instance,
// ganti backing store ke Redis.

const g = globalThis as unknown as { __rl?: Map<string, { count: number; reset: number }> };
const store = g.__rl ?? new Map<string, { count: number; reset: number }>();
if (!g.__rl) g.__rl = store;

export interface RateResult {
  ok: boolean;
  retryAfter?: number; // detik
}

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  const e = store.get(key);
  if (!e || now > e.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { ok: true };
  }
  if (e.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((e.reset - now) / 1000) };
  }
  e.count += 1;
  return { ok: true };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

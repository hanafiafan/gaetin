import IORedis from "ioredis";
import { env } from "@/lib/env";

// Koneksi Redis untuk BullMQ. maxRetriesPerRequest harus null untuk BullMQ.
const globalForRedis = globalThis as unknown as {
  redis: IORedis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

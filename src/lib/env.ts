import { z } from "zod";

// Validasi environment variable saat startup agar gagal cepat bila salah konfigurasi.
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET minimal 16 karakter"),
  JWT_EXPIRES_IN: z.string().default("24h"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  WA_PROVIDER: z.enum(["baileys", "gateway", "cloud_api"]).default("baileys"),
  WA_SESSION_DIR: z.string().default("./wa-sessions"),
  WA_GATEWAY_BASE_URL: z.string().optional(),
  WA_GATEWAY_TOKEN: z.string().optional(),

  XENDIT_SECRET_KEY: z.string().optional(),
  XENDIT_WEBHOOK_TOKEN: z.string().optional(),

  SCRAPER_SERVICE_URL: z.string().optional(),
  OVERPASS_API_URL: z.string().url().default("https://overpass-api.de/api/interpreter"),
});

// Parsing lazily agar bisa dipakai di edge/runtime berbeda tanpa crash saat import.
function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Environment variable tidak valid:", parsed.error.flatten().fieldErrors);
    throw new Error("Konfigurasi environment tidak valid. Cek file .env terhadap .env.example");
  }
  return parsed.data;
}

export const env = loadEnv();
export type Env = z.infer<typeof envSchema>;

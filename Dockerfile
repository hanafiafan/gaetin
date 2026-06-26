# ===== Builder =====
FROM node:20-slim AS builder
WORKDIR /app

# Prisma butuh openssl.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
# DATABASE_URL & JWT_SECRET dummy agar build (yang mengimpor env) tidak gagal.
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"
ENV JWT_SECRET="build-time-placeholder-secret-please-override"
RUN npm run build

# ===== Runner =====
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.mjs ./

# Folder sesi WhatsApp (di-mount sebagai volume agar persisten).
RUN mkdir -p /app/wa-sessions

EXPOSE 3000

# Jalankan migrasi lalu start server. Baileys hidup di dalam proses ini.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]

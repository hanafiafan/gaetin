# Gaetin

SaaS WhatsApp Marketing: **scrape leads dari Google Maps → kelola terstruktur → blast WhatsApp → layani balasan (inbox/CS) → tutup deal & ukur ROI**.

Dibangun dengan Next.js 14 (App Router), PostgreSQL + Prisma, Redis + BullMQ, Baileys (WhatsApp), Tailwind + shadcn/ui.

> Status: **scaffold**. Fondasi (config, schema database, struktur, abstraksi) sudah siap. Modul fitur dibangun bertahap.

---

## Prasyarat

- Node.js 20+ (disarankan 22)
- PostgreSQL 14+
- Redis 6+
- npm

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Siapkan environment
cp .env.example .env
#   lalu isi DATABASE_URL, REDIS_URL, JWT_SECRET, dll.

# 3. Generate Prisma client & buat tabel
npm run db:generate
npm run db:migrate

# 4. (opsional) Isi data demo
npm run db:seed
#   login demo: demo@nusantara.test / Demo1234

# 5. Jalankan dev server
npm run dev
```

Buka http://localhost:3000.

## Skrip

| Skrip | Fungsi |
|---|---|
| `npm run dev` | Jalankan dev server |
| `npm run build` / `start` | Build & jalankan production |
| `npm run typecheck` | Cek TypeScript tanpa emit |
| `npm run test` | Jalankan unit + property tests (Vitest) |
| `npm run db:migrate` | Buat/terapkan migrasi Prisma |
| `npm run db:studio` | Buka Prisma Studio |
| `npm run db:seed` | Isi data demo |

## Struktur

```
prisma/
  schema.prisma        # skema database lengkap (multi-tenant)
  seed.ts              # data demo
src/
  app/                 # Next.js App Router (UI + API routes)
  components/          # komponen UI (shadcn/ui + custom)
  config/
    plans.ts           # katalog plan, harga, kuota, fitur
  lib/
    db/prisma.ts       # Prisma client singleton
    redis.ts           # koneksi Redis (BullMQ)
    env.ts             # validasi environment (zod)
    utils.ts           # helper (cn, normalisasi nomor)
    messaging/
      provider.ts      # IMessagingProvider (abstraksi WA)
  types/               # tipe bersama
```

## Arsitektur penting

- **Multi-tenant**: semua data dimiliki `Workspace`; `User` terhubung lewat `Membership` (role OWNER/ADMIN/AGENT). Mendukung tim/agency.
- **Abstraksi provider WhatsApp** (`src/lib/messaging/provider.ts`): logika bisnis hanya bergantung pada interface `IMessagingProvider`, sehingga backend bisa ditukar antara Baileys (self-host), gateway (Fonnte/Wablas), atau WhatsApp Cloud API resmi tanpa mengubah service.
- **Queue-based**: operasi berat (blast, scraping, validasi, follow-up) lewat BullMQ worker.

## Catatan kepatuhan & risiko

- Scraping Google Maps melanggar ToS Google. Pertimbangkan Google Places API resmi atau penyedia data pihak ketiga, dan tampilkan disclaimer.
- Pengiriman via unofficial WhatsApp API (Baileys) berisiko **banned**. Schema sudah menyiapkan kontrol anti-ban (batas harian per nomor `dailyLimit`, warm-up, `DoNotContact`/opt-out). Terapkan ini di layer pengiriman, dan sediakan opsi Cloud API resmi untuk pelanggan yang butuh aman.

## Biaya & layanan pihak ketiga (stack hemat)

Gaetin dirancang agar **biaya tetap mendekati nol** — semua fitur inti berjalan di satu VPS tanpa langganan pihak ketiga. Biaya variabel selalu diikat ke paket langganan atau dipindah ke tenant (BYOK).

**Wajib & gratis (self-host di satu VPS):**

- PostgreSQL, Redis, aplikasi, dan scraper berjalan dalam satu server.
- WhatsApp via Baileys — tanpa API key, tanpa biaya per pesan (tiap tenant connect nomornya sendiri lewat QR).
- Peta: Leaflet + tile free tier; geocoding Nominatim (di-cache). Cukup untuk volume rendah picker lokasi.
- Scraper: self-host gosom/google-maps-scraper, tanpa API berbayar.

**Selaras pendapatan (bukan biaya tetap):**

- Billing Midtrans/Xendit — hanya potongan per transaksi.
- Email — free tier Resend/Brevo untuk transaksional.

**Hindari/tunda (penambah biaya untuk fitur belum penting):**

- Managed scraping API (SerpAPI, Apify), Google Maps Platform berbayar, geocoder berbayar, enrichment email, storage S3, monitoring berbayar. Tambahkan hanya bila terbukti perlu.

**Catatan skala:** karena WhatsApp memakai Baileys, biaya yang tumbuh seiring jumlah pengguna adalah RAM server (per koneksi nomor aktif), bukan tagihan pihak ketiga. Ini menentukan kapan VPS perlu di-upgrade — tetap jauh lebih murah daripada gateway per pesan.

Lihat `.env.example` untuk penanda `[WAJIB · GRATIS]` vs `[OPSIONAL · BERBAYAR]` per variabel.

## Roadmap fitur (ringkas)

1. Auth (register/login/JWT, lockout) + layout dashboard
2. Koneksi WhatsApp (Baileys) + status real-time (Socket.IO)
3. Scraper Google Maps + manajemen lead (segmen, scoring, dedup)
4. Blast + Campaign (queue, anti-ban) + validasi nomor
5. Inbox / Customer Service dua arah + auto-reply
6. CRM pipeline + Deal/ROI tracking
7. Follow-up otomatis + tasks
8. Subscription + billing Midtrans
9. Map view (analisis pasar) + white-label
```

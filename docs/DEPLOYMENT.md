# Panduan Deployment — Gaetin

Deploy dengan Docker Compose di satu VPS: aplikasi (Next.js + Baileys), PostgreSQL, Redis, dan Caddy (reverse proxy + SSL otomatis).

## Prasyarat

- VPS (mis. 2 vCPU / 4 GB RAM untuk awal) dengan Docker + Docker Compose.
- Domain yang diarahkan (A record) ke IP VPS, mis. `app.gaetin.id`.
- Port 80 & 443 terbuka.

## 1. Siapkan environment

Di server, clone repo lalu buat `.env`:

```bash
cp .env.example .env
```

Isi minimal:

```
JWT_SECRET=<hasil: openssl rand -base64 48>
NEXT_PUBLIC_APP_URL=https://app.gaetin.id
XENDIT_SECRET_KEY=<key Xendit>
XENDIT_WEBHOOK_TOKEN=<token webhook Xendit>
```

Lalu set variabel khusus compose (boleh di `.env` yang sama):

```
DOMAIN=app.gaetin.id
DB_PASSWORD=<password DB kuat>
```

> `DATABASE_URL` dan `REDIS_URL` otomatis di-override oleh compose ke service `db`/`redis`, jadi tidak perlu diatur manual untuk mode Docker.

## 2. Build & jalankan

```bash
docker compose up -d --build
```

Yang terjadi:
- `db` (Postgres) & `redis` menyala dengan volume persisten.
- `app` build, lalu saat start menjalankan `prisma migrate deploy` (membuat/menerapkan semua migrasi) dan `next start`.
- `caddy` menerbitkan sertifikat SSL otomatis untuk `DOMAIN` dan mem-proxy ke app.

Cek kesehatan:

```bash
curl https://app.gaetin.id/api/health   # {"ok":true,"db":"up"}
```

## 3. Buat super-admin

Akun super-admin ditandai lewat flag `isSuperAdmin`. Untuk akun pertama, daftar lewat UI lalu set flag via SQL:

```bash
docker compose exec db psql -U gaetin -d gaetin -c \
  "UPDATE \"User\" SET \"isSuperAdmin\" = true WHERE email = 'kamu@email.com';"
```

Setelah itu `/admin` bisa diakses.

## 4. Migrasi database

Migrasi dijalankan otomatis saat container `app` start (`prisma migrate deploy`). Untuk menjalankan manual:

```bash
docker compose exec app npx prisma migrate deploy
```

> Saat development, gunakan `npm run db:migrate` untuk membuat migrasi baru, commit folder `prisma/migrations/`, lalu deploy.

## 5. Webhook Xendit

Arahkan webhook Invoice Xendit ke `https://app.gaetin.id/api/webhooks/xendit` dengan Verification Token = `XENDIT_WEBHOOK_TOKEN`.

## 6. Backup database (otomatis harian)

Tambahkan cron di host:

```bash
0 2 * * * docker compose -f /path/docker-compose.yml exec -T db \
  pg_dump -U gaetin gaetin | gzip > /backups/gaetin-$(date +\%F).sql.gz
```

Uji restore secara berkala:

```bash
gunzip -c backup.sql.gz | docker compose exec -T db psql -U gaetin -d gaetin
```

## 7. Monitoring

- Endpoint `/api/health` untuk uptime check (UptimeRobot/Uptime Kuma).
- Log: `docker compose logs -f app`.
- Opsional: pasang Sentry (DSN) untuk error tracking.

## 8. Update versi

```bash
git pull
docker compose up -d --build
```

Migrasi baru otomatis diterapkan saat container start.

## Catatan penting

**Baileys = satu instance.** Koneksi WhatsApp & proses latar (scraper, blast, follow-up) hidup di dalam proses `app`. Karena itu **jangan menjalankan beberapa replika `app`** — sesi WhatsApp tidak dibagi antar proses. Skala dulu secara vertikal (RAM/CPU lebih besar). Bila perlu skala horizontal nanti, pindahkan pengiriman ke worker BullMQ terpisah dan/atau gateway WhatsApp.

**RAM.** Tiap nomor WhatsApp aktif memakai memori. Pantau dan upgrade VPS saat jumlah nomor/tenant bertumbuh.

**Sesi WhatsApp persisten.** Disimpan di volume `wa_sessions` (`/app/wa-sessions`). Jangan hapus volume ini agar nomor tidak perlu pairing ulang.

**CI/CD.** `.github/workflows/ci.yml` menjalankan lint tipe, test, dan build pada tiap push/PR. Untuk auto-deploy, tambahkan langkah SSH ke VPS yang menjalankan `git pull && docker compose up -d --build`, atau pakai registry image.

## Checklist produksi

- [ ] `.env` lengkap; `JWT_SECRET` & `DB_PASSWORD` kuat dan rahasia.
- [ ] Domain + SSL aktif (cek gembok https).
- [ ] `prisma migrate deploy` sukses (cek `/api/health`).
- [ ] Webhook Xendit terhubung (uji transaksi kecil).
- [ ] Backup harian berjalan + uji restore.
- [ ] Monitoring uptime aktif.
- [ ] Super-admin dibuat.
- [ ] Disclaimer kepatuhan (ToS Google, risiko WA) tampil.

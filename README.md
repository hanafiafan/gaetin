# Gaetin

Gaetin (nama sebelumnya Hellens) adalah platform prospek, kampanye WhatsApp/email, inbox, CRM, dan billing berbasis workspace.

## Arsitektur

- **Web/API:** Next.js 15, React 18, TypeScript.
- **Data:** PostgreSQL 16 dan Prisma 5.
- **Worker:** proses Node.js terpisah; antrean persisten `BackgroundJob` di PostgreSQL.
- **WhatsApp:** Express/Baileys gateway terpisah; aplikasi memakai HTTP dan menerima webhook.
- **Prospek:** ekstensi Google Maps, Overpass/OSM, atau Google Places dengan API key workspace.
- **Pembayaran:** Midtrans; invoice, aktivasi paket, kredit, dan ledger diselesaikan atomik.
- **Deployment:** Docker Compose + Caddy, atau Compose untuk Coolify.

`WA_PROVIDER=baileys` tetap diterima untuk kompatibilitas, tetapi transport aktual selalu gateway. `cloud_api` belum diimplementasikan dan ditolak secara eksplisit. Domain, logo, dan ID integrasi Hellens yang sudah dipakai pelanggan tidak diganti otomatis.

## Menjalankan lokal

Gunakan Node.js 22.12+ dan PostgreSQL 16. Salin `.env.example` ke `.env`, lalu isi `DATABASE_URL`, `JWT_SECRET`, `WA_GATEWAY_BASE_URL`, `WA_GATEWAY_TOKEN`, dan `WEBHOOK_SECRET`.

```sh
npm ci
npx prisma migrate deploy
npm run dev
```

Jalankan worker pada terminal kedua:

```sh
npm run worker
```

Jalankan gateway pada terminal ketiga:

```sh
cd gateway
npm ci
# Isi GATEWAY_TOKEN, WEBHOOK_URL, WEBHOOK_SECRET, SESSION_DIR, PORT pada environment.
npm start
```

Gateway lokal biasanya memakai port 3001; `WEBHOOK_URL` menunjuk ke `http://localhost:3000/api/whatsapp/webhook`. Worker wajib aktif untuk kampanye, email blast, follow-up, validasi, pencarian email, dan scraper server. Ekstensi tetap memasukkan hasil melalui endpoint khususnya.

## Model keandalan

- API menyimpan transisi status dan job dalam satu transaksi. Request execute bersamaan hanya memiliki satu pemenang.
- Satu worker aktif memegang advisory lock PostgreSQL melalui koneksi khusus. Worker kedua ditolak. Job `RUNNING` dipulihkan saat worker pengganti memperoleh lock.
- Kampanye, email, validasi, dan pencarian email diproses dalam batch kecil agar pekerjaan lain dapat berjalan. Scheduler memeriksa kampanye jatuh tempo dan aturan follow-up pada tiap putaran worker.
- Generasi job melindungi requeue/pause/resume dari penyelesaian proses lama.
- Kredit dan slot kuota WhatsApp dipesan atomik per ID pengiriman. Hari kuota memakai Asia/Jakarta, sama pada web dan worker.
- Gateway menyimpan receipt sebelum mengirim. Retry dengan ID sama memakai receipt yang sama. Volume sesi menyimpan receipt serta outbox webhook dan wajib persisten.
- Jika gateway mati saat pengiriman sehingga hasil tidak dapat dipastikan, receipt berstatus `UNKNOWN`; pesan tidak otomatis dikirim ulang. Kredit tetap dicadangkan sampai hasil dikonfirmasi. Ini menghindari klaim jaminan exactly-once yang tidak disediakan WhatsApp.
- Email yang hasilnya ambigu juga tidak dikirim ulang otomatis. Resend menerima idempotency key; receipt lokal tetap melindungi pemulihan setelah batas retensi provider.
- Webhook pesan masuk dideduplikasi berdasarkan ID provider, dan seluruh perubahan inbox/opt-out/follow-up disimpan atomik. Kegagalan database membalas 503; gateway menyimpan event hingga berhasil.
- Follow-up hanya berlaku setelah pesan keluar yang belum dibalas. Pesan follow-up tidak memicu dirinya sendiri. Kontak yang belum pernah dihubungi dikecualikan.
- Paket kedaluwarsa memengaruhi batas dan akses API; penggantian password mencabut seluruh sesi melalui versi sesi.

## Pengujian

```sh
npm run lint
npm run typecheck
npm test
node --test gateway/tests/*.test.js
npm run build
```

Tes database harus menggunakan database terpisah, bukan database pelanggan:

```sh
DATABASE_URL=postgresql://test:test@localhost:5432/gaetin_test npx prisma migrate deploy
TEST_DATABASE_URL=postgresql://test:test@localhost:5432/gaetin_test npm run test:integration
# Setelah npm run build, uji HTTP dengan gateway tiruan (tanpa pesan nyata):
TEST_DATABASE_URL=postgresql://test:test@localhost:5432/gaetin_test npm run test:e2e
```

`npm test` menjalankan unit/property tests. Tes integrasi memerlukan `TEST_DATABASE_URL` dan gagal bila database tidak tersedia; tidak ada lagi tes database yang tampak lulus tanpa menjalankan assertion. CI menyediakan PostgreSQL dan menjalankan kedua suite.

## Deployment dan operasi

Lihat [panduan deployment](docs/DEPLOYMENT.md), termasuk migrasi sistem lama, secret, pemulihan job, dan pemeriksaan pengiriman ambigu.

## Referensi pembaruan dependensi

- [Migrasi Next.js 15](https://nextjs.org/docs/app/guides/upgrading/version-15): request APIs dan route params menggunakan akses asinkron.
- [Distribusi resmi SheetJS](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/): versi registry npm lama diganti tarball resmi 0.20.3.

# Deployment Gaetin

## Layanan wajib

`app`, `worker`, `gateway`, dan `db`. Compose standar menambahkan Caddy. Compose Coolify memakai jaringan eksternal `coolify` dan routing Traefik yang sudah ada. Port aplikasi langsung hanya di-bind ke localhost; akses publik melewati reverse proxy.

Jalankan hanya **satu worker** dan **satu gateway untuk satu volume sesi**. Worker memakai koneksi PostgreSQL khusus untuk advisory lock; jangan arahkan koneksi worker melalui PgBouncer transaction pooling. Duplikat worker keluar dengan error dan tidak menjalankan job.

## Konfigurasi

- `DATABASE_URL`: PostgreSQL aplikasi. Compose mengarahkannya ke service `db`.
- `JWT_SECRET`: secret penandatanganan sesi.
- `WA_GATEWAY_TOKEN`: token aplikasi/worker ke gateway. Set sebagai `GATEWAY_TOKEN` pada gateway.
- `WEBHOOK_SECRET`: secret gateway ke aplikasi. Gunakan nilai terpisah dari JWT.
- `WA_GATEWAY_BASE_URL`: `http://gateway:3001` di Compose.
- `NEXT_PUBLIC_APP_URL`: URL publik aplikasi.
- Compose standar: `DB_USER`, `DB_PASSWORD`, `DOMAIN`.
- Coolify: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, serta secret di atas.

Konfigurasi Midtrans dan email mengikuti integrasi admin yang sudah ada. Jangan menyalin secret produksi ke database pengujian.

## Instalasi baru

```sh
docker compose up -d --build
```

App dan worker menjalankan `prisma migrate deploy` sebelum mulai. PostgreSQL memakai lock migrasi. Jika proses kedua gagal memperoleh lock saat instalasi awal, restart policy akan mencoba kembali. Worker/gateway healthcheck memeriksa proses; `/api/health` memeriksa koneksi database aplikasi.

## Upgrade instalasi lama

1. Buat backup PostgreSQL dan volume `wa_sessions`.
2. Pause kampanye dan hentikan proses app/worker lama. Tunggu pengiriman yang sedang berlangsung selesai sebelum migrasi. Pengiriman versi lama tidak memiliki receipt; jangan otomatis melanjutkan pesan yang hasilnya belum jelas.
3. Isi `WA_GATEWAY_TOKEN` dan `WEBHOOK_SECRET` terpisah pada konfigurasi deployment.
4. Deploy app, worker, gateway, dan migrasi bersama-sama. Jangan mencampur gateway lama yang tidak mendukung idempotency key dengan worker baru.
5. Verifikasi health, gateway tersambung, login, dan worker log `Gaetin worker ready`.
6. Uji satu pesan ke nomor pengujian serta checkout sandbox sebelum menerima pengiriman/pembayaran produksi.

Migrasi menambahkan tabel job/delivery/validasi/rate-limit serta field waktu pesan dan versi sesi. Waktu pesan lama direkonstruksi dari bukti pesan tersimpan, bukan `lastContacted` yang ambigu. Riwayat pesan duplikat dipertahankan; hanya ID provider pada duplikat setelah baris pertama yang dikosongkan agar unique index dapat diterapkan. Receipt historis tidak menagih ulang kredit. Invoice baru menyimpan snapshot alokasi kredit; invoice lama memakai katalog saat settlement karena snapshot historis tidak tersedia.

## Pemantauan

- Periksa `docker compose logs worker gateway app`.
- `BackgroundJob.status=FAILED` menyimpan alasan di `error`; worker mencoba maksimum lima kali dengan backoff.
- Kampanye/blast yang kehabisan retry dipause/stop agar dapat dilanjutkan setelah penyebab diperbaiki. Job yang sudah selesai tidak dijalankan ulang hanya karena proses restart.
- Receipt/outbox gateway berada di `wa_sessions/.gateway/`. Jangan menghapus receipt saat kampanye masih bisa diretry. File sesi dan receipt memerlukan backup serta pemantauan disk.
- `OutboundDelivery.status=UNKNOWN` berarti hasil perlu dikonfirmasi pada WhatsApp/provider email. Jangan mengirim ulang atau mengembalikan kredit sebelum memastikan pesan benar-benar gagal. Hasil yang diketahui gagal dikembalikan kreditnya atomik; hasil ambigu tetap dicadangkan.
- Untuk pemeriksaan dan rekonsiliasi gunakan endpoint super-admin `/api/admin/deliveries` dan `/api/admin/deliveries/:id` (PATCH dengan `status: SENT|FAILED` dan `note`). Rekonsiliasi tersedia untuk UNKNOWN lebih dari 5 menit atau PENDING lebih dari 24 jam, hanya setelah hasil dikonfirmasi pada provider. Status FAILED mengembalikan kredit satu kali. Tidak ada pengiriman ulang otomatis.
- Follow-up aktif diperiksa secara berkala saat worker berjalan; jadwal bukan jaminan waktu real-time. Beban antrean, delay pengiriman, dan durasi scraper dapat menunda eksekusi.

## Batas yang perlu dipahami

Baileys tidak menyediakan transaksi atomik bersama PostgreSQL. Sistem menggunakan receipt persisten dan menghentikan pengiriman ambigu, bukan menjanjikan exactly-once mutlak. Pengujian lokal memakai provider tiruan; koneksi WhatsApp nyata, Midtrans sandbox, dan infrastruktur deployment harus diverifikasi menggunakan akun pengujian di lingkungan tujuan.

DNS, domain, konfigurasi akun eksternal, dan data produksi tidak diubah oleh perbaikan kode ini.

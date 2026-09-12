# Gaetin WhatsApp Gateway

Gateway Express/Baileys untuk aplikasi dan worker Gaetin. Gunakan Node.js 22, satu instance gateway per volume sesi, dan volume persisten.

| Environment | Fungsi |
|---|---|
| GATEWAY_TOKEN | Bearer token aplikasi/worker |
| WEBHOOK_URL | URL `/api/whatsapp/webhook` aplikasi |
| WEBHOOK_SECRET | Secret webhook, terpisah dari JWT aplikasi |
| SESSION_DIR | Direktori sesi persisten; default `./wa-sessions` |
| PORT | Port HTTP; default 3001 |

`npm ci && npm start` menjalankan gateway. `npm test` menjalankan tes receipt dan outbox tanpa WhatsApp nyata.

Endpoint: `GET /health`, `POST /connect/:accountId`, `GET /qr/:accountId`, `POST /disconnect/:accountId`, `POST /send`, dan `POST /is-registered`. Semua selain health memerlukan Bearer token.

`/send` menerima `accountId`, `phone`, `text`, dan **idempotencyKey wajib**. Gateway menyimpan receipt di `.gateway/receipts` sebelum mengirim. Request berulang dengan payload sama tidak menggandakan pengiriman, termasuk setelah restart. Payload berubah dengan key sama ditolak. Hasil pengiriman yang terputus dan tidak dapat dipastikan ditandai `uncertain`; jangan otomatis mengirim ulang dengan key baru.

Webhook disimpan di `.gateway/outbox` dan dicoba ulang sampai aplikasi membalas sukses. Jangan menghapus `.gateway` saat memulihkan sesi. Backup volume dan pantau kapasitas disk. Pemulihan sesi mengabaikan direktori internal `.gateway`.

Compose utama maupun Coolify sudah menyertakan gateway. Jika memakai Railway atau host lain, pasang volume ke `SESSION_DIR`, atur URL webhook, dan sesuaikan `WA_GATEWAY_BASE_URL` aplikasi/worker. Jangan menjalankan gateway lama bersama worker baru.

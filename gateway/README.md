# Gaetin WA Gateway

Server Baileys persisten untuk koneksi WhatsApp. Di-deploy di Railway, dipanggil oleh aplikasi Next.js di Vercel.

## Environment Variables

| Variable | Required | Keterangan |
|---|---|---|
| `GATEWAY_TOKEN` | ✅ | Bearer token untuk auth request dari Next.js |
| `WEBHOOK_URL` | ✅ | URL webhook Next.js (misal: `https://gaetin.vercel.app/api/whatsapp/webhook`) |
| `WEBHOOK_SECRET` | ✅ | Secret bersama untuk validasi webhook |
| `SESSION_DIR` | ❌ | Folder session (default: `./wa-sessions`) |
| `PORT` | ❌ | Port server (default: 3001, Railway set otomatis) |

## Deploy ke Railway

1. Buat project baru di Railway
2. Connect repo ini (pilih folder `gateway/` sebagai root)
3. Set environment variables di atas
4. Railway otomatis deploy saat push ke main

## Endpoints

| Method | Path | Keterangan |
|---|---|---|
| GET | `/health` | Health check (tanpa auth) |
| POST | `/connect/:accountId` | Mulai koneksi WhatsApp |
| GET | `/qr/:accountId` | Ambil QR + status saat ini |
| POST | `/disconnect/:accountId` | Putuskan koneksi |
| POST | `/send` | Kirim pesan teks |
| POST | `/is-registered` | Cek apakah nomor terdaftar di WA |

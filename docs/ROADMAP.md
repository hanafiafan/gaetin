# Roadmap Pembuatan Gaetin — Sampai Siap Produksi

Dokumen ini memetakan seluruh perjalanan dari kondisi sekarang hingga aplikasi benar-benar jadi, siap di-deploy, dan terhubung dengan layanan pihak ketiga. Disusun per fase berdasarkan ketergantungan dan nilai.

**Prinsip biaya:** integrasi pihak ketiga yang berbayar (Midtrans live, email domain, tile peta, proxy, gateway WA) sengaja ditempatkan di fase akhir. Fase 1–4 bisa dikerjakan penuh hanya dengan satu VPS tanpa langganan apa pun.

---

## Status saat ini (selesai)

- Fondasi proyek: konfigurasi, schema database (29 model), Prisma client, Redis, validasi env, abstraksi provider WhatsApp.
- Autentikasi & keamanan: register/login/logout, JWT + cookie httpOnly, account lockout, multi-tenant (Workspace + Membership).
- Dashboard: layout, sidebar, header, halaman overview dengan metrik nyata.
- Koneksi WhatsApp: Baileys (QR, reconnect, multi-nomor) + halaman Pengaturan.
- Kontak & Lead: CRUD, pencarian/filter/pagination, bulk action, kuota per plan, dedup.

---

## Ringkasan fase

| Fase | Fokus | Output utama | Pihak ketiga | Status |
|------|-------|--------------|--------------|--------|
| 0 | Fondasi | Scaffold, auth, dashboard, WA connect, kontak | — | Selesai |
| 1 | Mesin Lead | Scraper + map picker, impor CSV, kurasi & segmen | Tile peta (free tier) | Berikutnya |
| 2 | Mesin Outreach | Validasi nomor, Blast, Campaign, queue, anti-ban, template | — | — |
| 3 | Percakapan & CRM | Inbox/CS, auto-reply, click-to-chat, pipeline, Deal/ROI, follow-up, tasks | — | — |
| 4 | Analitik & Insight | Funnel, ROI, atribusi, chart, map view, kanban lanjutan, kalender | — | — |
| 5 | Monetisasi | Subscription, quota enforcement, billing, landing page, white-label | Midtrans (sandbox), email (free tier) | — |
| 6 | Tim & Pengerasan | Role/izin, audit log, support, keamanan, rate limit, pengujian | — | — |
| 7 | Deployment & Ops | Docker, VPS, worker persisten, migrasi, backup, monitoring, CI/CD | Hosting/VPS, domain, SSL | — |
| 8 | Go-Live 3rd Party | Midtrans live, email domain, tile, proxy, gateway/API resmi, launch | Semua produksi | — |

---

## Fase 1 — Mesin Lead

**Tujuan:** pengguna bisa mendapatkan lead masuk ke sistem dari tiga sumber dan mengelolanya terstruktur.

**Deliverable**
- [ ] Map picker (Leaflet + tile) dengan titik pusat + slider radius + reverse-geocoding (Req 6.9–6.11).
- [ ] Scraper service: trigger job (titik pusat/radius atau lokasi teks), grid pencarian, penyaringan haversine (Req 6.12–6.13).
- [ ] Integrasi engine scraping (gosom/google-maps-scraper sebagai microservice) di balik `SCRAPER_SERVICE_URL`.
- [ ] Worker BullMQ untuk job scraping + progress real-time + simpan `Lead`.
- [ ] Impor kontak CSV/Excel dengan mapping kolom & laporan error (Req 5).
- [ ] Kurasi lead → konversi ke kontak; segmen (saved filter); lead scoring otomatis.

**Pihak ketiga:** tile peta free tier (MapTiler/Stadia) atau OSM; proxy scraper opsional (tunda).

**Kriteria selesai:** dari peta, jalankan scrape, hasil tersimpan sebagai lead, dikurasi jadi kontak, dan tersaring dalam radius.

---

## Fase 2 — Mesin Outreach

**Tujuan:** mengirim pesan ke kontak secara aman dan terukur.

**Deliverable**
- [ ] Validasi nomor WhatsApp massal (Req 7) + update status kontak.
- [ ] Blast: editor pesan, variabel personalisasi, media, pemilihan penerima/segmen (Req 2).
- [ ] Campaign manager: penjadwalan, pause/resume, metrik (Req 3).
- [ ] Queue BullMQ + worker pengirim dengan jeda acak & progress real-time.
- [ ] Kontrol anti-ban: batas harian per nomor, warm-up, quiet hours, throttling adaptif.
- [ ] Template & variasi pesan (spintax), pratinjau render (Req 21).
- [ ] Do-Not-Contact otomatis dari kata kunci opt-out.

**Pihak ketiga:** tidak ada (Baileys self-host).

**Kriteria selesai:** blast terjadwal terkirim ke segmen dengan jeda aman, progress terlihat, nomor mati tersaring, opt-out dihormati.

---

## Fase 3 — Percakapan & CRM

**Tujuan:** menutup loop dari balasan sampai closing.

**Deliverable**
- [ ] Inbox/CS dua arah: tangkap pesan masuk (messages.upsert) → Conversation/InboxMessage (Req 22 dasar).
- [ ] Assignment ke agen, status percakapan, quick replies, template balasan.
- [ ] Auto-reply berbasis kata kunci + pengecualian DNC (Req 22).
- [ ] Click-to-chat link/QR → lead INBOUND otomatis (Req 23).
- [ ] CRM pipeline kanban: drag-and-drop, kolom kustom, kartu kontak (Req 8).
- [ ] Deal & ROI: nilai deal saat closing, ringkasan revenue per kampanye.
- [ ] Follow-up otomatis (trigger no-reply/stage/tanggal) + berhenti saat membalas (Req 9).
- [ ] Tasks & pengingat manual (Req 10).

**Pihak ketiga:** tidak ada.

**Kriteria selesai:** balasan masuk muncul di inbox, bisa dibalas/di-assign; kontak bergerak di pipeline; deal & follow-up tercatat.

---

## Fase 4 — Analitik & Insight

**Tujuan:** mengubah data jadi keputusan.

**Deliverable**
- [ ] Dashboard analitik: total terkirim, delivery/read/reply rate, kontak aktif (Req 4).
- [ ] Funnel konversi, ROI per kampanye, atribusi sumber lead (Req 19).
- [ ] Chart tren (Recharts), ekspor laporan PDF/Excel.
- [ ] Map view analisis pasar: sebaran lead + clustering + filter (Req 18).
- [ ] Kanban & workflow lanjutan: multi-pipeline, nilai deal/kolom, WIP, kalender kampanye, papan task (Req 20).
- [ ] Analisis jam terbaik kirim.

**Pihak ketiga:** tile peta (sama seperti Fase 1).

**Kriteria selesai:** semua chart/laporan menampilkan data nyata dan dapat difilter per periode.

---

## Fase 5 — Monetisasi

**Tujuan:** sistem bisa menjual langganan dan membatasi pemakaian sesuai paket.

**Deliverable**
- [ ] Subscription state machine (trial → active → expired → blocked) + cron transisi (Req 16).
- [ ] Quota enforcement & middleware fitur Pro-only / read-only (Req 16).
- [ ] Billing Midtrans: checkout Snap, webhook signature SHA-512, idempotency, invoice PDF (Req 17).
- [ ] Email notifikasi: konfirmasi bayar, pengingat perpanjangan, trial berakhir.
- [ ] Landing page publik: hero, fitur, harga (toggle bulanan/tahunan), FAQ, CTA (Req 15).
- [ ] White-label branding (logo, warna, nama) (Req 11).

**Pihak ketiga:** Midtrans (mulai sandbox), email (free tier Resend/Brevo).

**Kriteria selesai:** alur daftar → checkout sandbox → langganan aktif → kuota berlaku → invoice terkirim.

---

## Fase 6 — Tim & Pengerasan

**Tujuan:** siap dipakai tim/agency dan aman.

**Deliverable**
- [ ] Role & izin (Owner/Admin/Agent) ditegakkan di API & UI.
- [ ] Audit log aktivitas + multi-nomor WA dengan rotasi/load-balance.
- [ ] Modul support: tiket, FAQ, dokumentasi, tooltip onboarding (Req 13).
- [ ] Keamanan: rate limiting, proteksi CSRF/headers, validasi input menyeluruh, secret management.
- [ ] Tema dark/light + responsif final (Req 12).
- [ ] Pengujian: unit (Vitest), property-based (fast-check) untuk properti di design.md, integration, e2e (Playwright) untuk alur utama.

**Pihak ketiga:** tidak ada.

**Kriteria selesai:** test suite hijau, role berfungsi, audit tercatat, lulus pemeriksaan keamanan dasar.

---

## Fase 7 — Deployment & Operasional

**Tujuan:** aplikasi berjalan stabil di server produksi.

**Deliverable**
- [ ] Dockerize: image untuk web app, worker (BullMQ + Baileys), dan scraper service.
- [ ] Provisioning VPS: Node, PostgreSQL, Redis (managed atau self-host), reverse proxy (Nginx/Caddy).
- [ ] Worker persisten untuk Baileys (PM2/systemd/container) — proses long-running, bukan serverless.
- [ ] Strategi migrasi Prisma untuk produksi (`prisma migrate deploy`).
- [ ] Backup otomatis database harian + uji restore.
- [ ] Logging terstruktur + monitoring/alerting (free tier: Uptime Kuma, Grafana/Loki, atau Sentry free).
- [ ] CI/CD (GitHub Actions): lint, typecheck, test, build, deploy.
- [ ] Domain + SSL (Let’s Encrypt), variabel environment produksi, rotasi secret.
- [ ] Penyimpanan media: disk VPS atau S3-compatible (sesuai kebutuhan).

**Pihak ketiga:** penyedia VPS/hosting, registrar domain, penyedia SSL (gratis).

**Kriteria selesai:** push ke main → otomatis ter-deploy; app online via domain ber-SSL; backup berjalan; worker WA stabil.

---

## Fase 8 — Go-Live Pihak Ketiga & Launch

**Tujuan:** semua integrasi pindah ke mode produksi dan produk diluncurkan.

**Deliverable**
- [ ] Midtrans production: verifikasi bisnis, server/client key live, uji transaksi nyata kecil.
- [ ] Email domain: SPF/DKIM/DMARC agar email masuk inbox, bukan spam.
- [ ] Tile peta: API key provider (jika lewati free tier) + pemantauan kuota.
- [ ] Proxy scraper (opsional): kredensial provider + metering per tenant.
- [ ] Opsi WhatsApp gateway/Cloud API resmi (BYOK) untuk pelanggan yang butuh aman.
- [ ] Disclaimer kepatuhan (ToS Google, risiko ban WA) tampil di UI & onboarding.
- [ ] Uji beban ringan, beta tertutup, lalu rilis publik.

**Pihak ketiga:** Midtrans (live), penyedia email, tile peta, proxy, gateway/Cloud API (opsional).

**Kriteria selesai:** pembayaran nyata berhasil, email terkirim ke inbox, dan onboarding pengguna baru berjalan end-to-end.

---

## Checklist kesiapan produksi (global)

- [ ] Semua env produksi terisi & secret aman (tidak ter-commit).
- [ ] Migrasi DB konsisten; backup + uji restore berhasil.
- [ ] HTTPS aktif; security headers & rate limiting terpasang.
- [ ] Worker Baileys berjalan sebagai proses persisten dengan auto-restart.
- [ ] Monitoring uptime + alert error aktif.
- [ ] Test suite hijau di CI sebelum deploy.
- [ ] Disclaimer hukum & opt-out aktif.
- [ ] Rencana rollback jelas (image/versi sebelumnya).

## Catatan integrasi pihak ketiga (kapan & kenapa)

| Layanan | Fase | Sifat biaya |
|---------|------|-------------|
| Tile peta (MapTiler/OSM) | 1, 4 | Gratis (free tier) |
| Midtrans | 5 (sandbox) → 8 (live) | Per transaksi |
| Email (Resend/Brevo) | 5 | Free tier |
| VPS + domain + SSL | 7 | Biaya tetap kecil |
| Proxy scraper | 8 (opsional) | Variabel, ditutup paket |
| WA gateway/Cloud API | 8 (opsional/BYOK) | Per pesan / per percakapan |

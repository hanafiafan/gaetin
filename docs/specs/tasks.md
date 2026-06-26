# Rencana Implementasi: WhatsApp Marketing Platform

## Overview

Implementasi platform pemasaran WhatsApp full-stack menggunakan Next.js 14 (App Router), PostgreSQL + Prisma ORM, BullMQ + Redis untuk queue, Baileys untuk WhatsApp API, Socket.IO untuk real-time, dan Tailwind CSS + shadcn/ui untuk UI. Setiap task membangun di atas task sebelumnya secara inkremental.

## Tasks

- [x] 1. Setup struktur proyek dan konfigurasi dasar
  - [x] 1.1 Inisialisasi proyek Next.js 14 dengan App Router dan konfigurasi dasar
    - Buat proyek Next.js 14 dengan TypeScript
    - Konfigurasi Tailwind CSS dan shadcn/ui
    - Setup Prisma ORM dengan koneksi PostgreSQL
    - Konfigurasi Redis dan BullMQ
    - Setup Vitest dan fast-check untuk testing
    - Buat struktur direktori sesuai desain (`src/app`, `src/components`, `src/lib`, `src/hooks`, `src/store`, `src/types`, `src/config`)
    - _Requirements: 12.1_

  - [x] 1.2 Definisikan tipe TypeScript dan interface utama
    - Buat file `src/types/` dengan semua interface service (IWhatsAppService, IBlastService, ICampaignService, dll)
    - Definisikan DTOs dan enum types
    - Buat shared types untuk error response dan API response
    - _Requirements: 12.1_

  - [x] 1.3 Buat schema database Prisma dan jalankan migrasi
    - Tulis seluruh schema Prisma sesuai desain (User, WhatsAppSession, Contact, Blast, Campaign, Pipeline, Task, FollowUpRule, ScraperJob, Lead, BrandingSettings, SupportTicket, dll)
    - Jalankan `prisma migrate dev` untuk membuat tabel
    - Buat Prisma client singleton
    - _Requirements: 14.3, 5.3, 8.1_

  - [x] 1.4 Setup Zod validation schemas
    - Implementasikan semua validation schemas (RegisterSchema, LoginSchema, CreateBlastSchema, CreateCampaignSchema, ContactSchema, CreateTaskSchema, dll)
    - Buat utility function untuk validasi
    - _Requirements: 14.8, 2.1, 3.2, 5.3, 10.1_


- [x] 2. Implementasi Autentikasi dan Keamanan
  - [x] 2.1 Implementasi API auth (register, login, logout, refresh token)
    - Buat route handlers di `src/app/api/auth/`
    - Implementasikan registrasi dengan bcrypt hashing (salt factor 10)
    - Implementasikan login dengan JWT token (expiry 24 jam)
    - Implementasikan logout dengan invalidasi token di database
    - Implementasikan refresh token
    - Implementasikan account lockout setelah 5 kali gagal login (15 menit)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.8, 14.9_

  - [x] 2.2 Buat auth middleware dan proteksi route
    - Buat JWT verification middleware untuk API routes
    - Implementasikan pengecekan token invalidasi
    - Buat redirect ke login saat token expired
    - _Requirements: 14.5, 14.6, 14.7_

  - [x] 2.3 Tulis property tests untuk autentikasi
    - **Property 31: Login Valid Menghasilkan JWT Dengan Expiry Benar**
    - **Property 32: Pesan Error Login Generik**
    - **Property 33: Validitas Hash Bcrypt**
    - **Property 34: Validasi Kekuatan Password**
    - **Property 35: Invalidasi Token Setelah Logout**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.5, 14.8, 14.9**

  - [x] 2.4 Buat halaman login dan register
    - Buat halaman login di `src/app/(auth)/login/`
    - Buat halaman register di `src/app/(auth)/register/`
    - Implementasikan form validation dengan Zod
    - Tampilkan pesan error generik untuk login gagal
    - _Requirements: 14.1, 14.2, 14.8_

- [~] 3. Checkpoint - Pastikan autentikasi berfungsi
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.

- [x] 4. Implementasi Koneksi WhatsApp
  - [x] 4.1 Buat WhatsApp service dengan Baileys
    - Implementasikan `src/lib/whatsapp/` connection manager
    - Buat fungsi connect yang menghasilkan QR code
    - Implementasikan auto-reconnect (3 kali, interval 10 detik)
    - Implementasikan disconnect dan hapus session
    - Simpan session data ke database
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7_

  - [x] 4.2 Buat API routes untuk WhatsApp connection
    - Implementasikan `GET /api/whatsapp/status`
    - Implementasikan `POST /api/whatsapp/connect`
    - Implementasikan `POST /api/whatsapp/disconnect`
    - Implementasikan `GET /api/whatsapp/qr`
    - _Requirements: 1.1, 1.2, 1.6_

  - [x] 4.3 Setup Socket.IO server untuk real-time status updates
    - Konfigurasi Socket.IO server di Next.js
    - Emit event untuk perubahan status koneksi
    - Emit event untuk QR code baru
    - Buat client-side hook `useWhatsAppStatus`
    - _Requirements: 1.3, 1.4, 1.5_

  - [x] 4.4 Buat UI komponen koneksi WhatsApp
    - Buat komponen QR code display
    - Buat indikator status koneksi (hijau/merah) di header
    - Buat tombol connect/disconnect
    - Tampilkan notifikasi saat koneksi terputus
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_


- [x] 5. Implementasi WhatsApp Blast
  - [x] 5.1 Buat Blast service dan BullMQ queue
    - Implementasikan `src/lib/services/blast.service.ts`
    - Buat BullMQ queue definition di `src/lib/queue/blast.queue.ts`
    - Buat worker di `src/lib/workers/blast.worker.ts`
    - Implementasikan jeda acak 3-8 detik antar pesan
    - Implementasikan stop/resume blast
    - Tracking progress (terkirim, gagal, tersisa)
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 5.2 Buat API routes untuk Blast
    - Implementasikan `GET /api/blast` - daftar blast
    - Implementasikan `POST /api/blast` - buat blast baru
    - Implementasikan `POST /api/blast/:id/execute` - eksekusi blast
    - Implementasikan `POST /api/blast/:id/stop` - hentikan blast
    - Implementasikan `GET /api/blast/:id/progress` - progress
    - Implementasikan `GET /api/blast/:id/report` - laporan hasil
    - Validasi koneksi WhatsApp sebelum eksekusi
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 5.3 Tulis property tests untuk Blast
    - **Property 1: Validasi Payload Pesan Blast**
    - **Property 2: Estimasi Waktu Pengiriman Blast**
    - **Property 3: Jeda Antar Pesan Blast Dalam Rentang Valid**
    - **Property 4: Invariant Jumlah Pesan Blast**
    - **Validates: Requirements 2.1, 2.2, 2.4, 2.5, 2.8**

  - [x] 5.4 Buat UI halaman Blast
    - Buat halaman daftar blast di `src/app/(dashboard)/blast/`
    - Buat editor pesan dengan dukungan teks, gambar, dokumen, dan variabel personalisasi
    - Buat komponen pemilihan kontak penerima
    - Tampilkan estimasi waktu pengiriman
    - Buat progress bar real-time dengan Socket.IO
    - Buat halaman laporan hasil blast
    - _Requirements: 2.1, 2.2, 2.5, 2.8_

- [ ] 6. Implementasi Campaign Manager
  - [x] 6.1 Buat Campaign service dan scheduling
    - Implementasikan `src/lib/services/campaign.service.ts`
    - Implementasikan pembuatan, update, dan delete kampanye
    - Implementasikan scheduling dengan BullMQ delayed jobs
    - Implementasikan pause/resume dengan penyimpanan posisi terakhir
    - Implementasikan kalkulasi metrik (delivery rate, read rate, reply rate)
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 6.2 Buat API routes untuk Campaign
    - Implementasikan semua endpoint di `src/app/api/campaigns/`
    - Validasi form kampanye (nama, penerima, template)
    - Implementasikan scheduling minimal 5 menit dari sekarang
    - Implementasikan pause dan resume
    - Implementasikan endpoint metrik
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 6.3 Tulis property tests untuk Campaign
    - **Property 5: Validasi Form Kampanye**
    - **Property 6: Kalkulasi Rate Metrik Kampanye**
    - **Property 7: Resume Kampanye Dari Posisi Terakhir**
    - **Validates: Requirements 3.2, 3.3, 3.6, 3.8**

  - [x] 6.4 Buat UI halaman Campaign
    - Buat halaman daftar kampanye dengan status
    - Buat form pembuatan kampanye
    - Buat tampilan metrik real-time (delivery rate, read rate, reply rate)
    - Implementasikan tombol pause/resume
    - _Requirements: 3.1, 3.2, 3.6, 3.7, 3.8_

- [~] 7. Checkpoint - Pastikan blast dan campaign berfungsi
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.


- [ ] 8. Implementasi Import Kontak dari CSV/Excel
  - [x] 8.1 Buat Import service
    - Implementasikan `src/lib/services/import.service.ts`
    - Implementasikan parsing CSV dan Excel (menggunakan library seperti papaparse dan xlsx)
    - Implementasikan validasi file (ukuran max 10MB, max 50.000 baris, format .csv/.xlsx/.xls)
    - Implementasikan preview 10 baris pertama
    - Implementasikan mapping kolom
    - Implementasikan validasi nomor telepon per baris (regex `^\+?\d{8,15}$`)
    - Implementasikan deteksi duplikat berdasarkan nomor telepon
    - Buat laporan error dengan nomor baris dan alasan
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 8.2 Buat API routes untuk Import
    - Implementasikan `POST /api/contacts/import` - upload dan validasi file
    - Implementasikan `GET /api/contacts/import/:id/status` - status import
    - Implementasikan endpoint untuk konfirmasi mapping dan eksekusi import
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

  - [x] 8.3 Tulis property tests untuk Import
    - **Property 11: Validasi dan Identifikasi Baris Import CSV**
    - **Property 12: Invariant Jumlah Import**
    - **Property 13: Preview Import Maksimal 10 Baris**
    - **Validates: Requirements 5.1, 5.3, 5.4, 5.5**

  - [x] 8.4 Buat UI halaman Import Kontak
    - Buat komponen file uploader dengan validasi format dan ukuran
    - Buat tampilan preview data (10 baris pertama)
    - Buat antarmuka mapping kolom (drag-drop atau dropdown)
    - Buat tampilan progress import
    - Buat tampilan ringkasan hasil (berhasil, duplikat, error)
    - _Requirements: 5.1, 5.2, 5.5_

- [x] 9. Implementasi Manajemen Kontak
  - [x] 9.1 Buat Contact service dan API routes
    - Implementasikan CRUD kontak di `src/lib/services/contact.service.ts`
    - Buat API routes di `src/app/api/contacts/`
    - Implementasikan pagination, filter, dan pencarian
    - Validasi nomor telepon dengan Zod schema
    - _Requirements: 5.3, 8.4, 8.6_

  - [x] 9.2 Buat UI halaman Kontak
    - Buat halaman daftar kontak dengan DataTable (sortable, filterable, paginated)
    - Buat form tambah/edit kontak
    - Buat halaman detail kontak (riwayat percakapan, tasks, aktivitas)
    - _Requirements: 8.4, 8.5, 10.5_

- [x] 10. Implementasi Google Maps Scraper
  - [x] 10.1 Buat Scraper service dengan Puppeteer
    - Implementasikan `src/lib/scraper/` dengan Puppeteer
    - Buat BullMQ queue untuk scraping jobs
    - Implementasikan ekstraksi data (nama bisnis, telepon, alamat, rating, kategori, jumlah review)
    - Implementasikan filter (lokasi/kelurahan, rating minimum, kategori)
    - Implementasikan deteksi duplikat
    - Batas maksimal 500 data per job
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 10.2 Buat API routes untuk Scraper
    - Implementasikan `POST /api/scraper/start`
    - Implementasikan `POST /api/scraper/:id/stop`
    - Implementasikan `GET /api/scraper/:id/progress`
    - Implementasikan `GET /api/scraper/results` dengan filter
    - _Requirements: 6.1, 6.6, 6.7, 6.8_

  - [x] 10.3 Tulis property tests untuk Scraper
    - **Property 14: Filter Hasil Scraper**
    - **Property 15: Invariant Jumlah Scraper**
    - **Validates: Requirements 6.3, 6.4, 6.5, 6.6**

  - [x] 10.4 Buat UI halaman Scraper
    - Buat form input kata kunci dan lokasi
    - Buat tampilan progress scraping real-time
    - Buat tabel hasil dengan filter (lokasi, rating, kategori)
    - Buat tombol konversi lead ke kontak
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6, 6.7_

- [~] 11. Checkpoint - Pastikan import, kontak, dan scraper berfungsi
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.


- [ ] 12. Implementasi Validasi Nomor WhatsApp
  - [x] 12.1 Buat Validator service
    - Implementasikan `src/lib/services/validator.service.ts`
    - Buat BullMQ queue untuk validasi jobs
    - Implementasikan pengecekan nomor via Baileys (onWhatsApp)
    - Implementasikan jeda acak 2-5 detik antar pengecekan
    - Implementasikan stop/cancel validasi
    - Update status kontak (Aktif WA, Tidak Aktif WA, Tidak Dapat Diverifikasi)
    - Batas maksimal 10.000 nomor per sesi
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 12.2 Buat API routes untuk Validator
    - Implementasikan `POST /api/validator/start`
    - Implementasikan `POST /api/validator/:id/stop`
    - Implementasikan `GET /api/validator/:id/progress`
    - Validasi koneksi WhatsApp sebelum memulai
    - _Requirements: 7.1, 7.3, 7.7, 7.8_

  - [x] 12.3 Tulis property tests untuk Validator
    - **Property 16: Status Validasi Nomor WhatsApp**
    - **Property 17: Invariant Jumlah Validasi**
    - **Property 18: Jeda Antar Pengecekan Validasi Dalam Rentang Valid**
    - **Property 19: Kalkulasi Persentase Progress Validasi**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5**

  - [x] 12.4 Buat UI halaman Validator
    - Buat antarmuka pemilihan kontak/lead untuk validasi
    - Buat tampilan progress validasi (persentase dan jumlah)
    - Buat tampilan ringkasan hasil (aktif, tidak aktif, tidak dapat diverifikasi)
    - Buat tombol batalkan validasi
    - _Requirements: 7.1, 7.3, 7.5, 7.7_

- [ ] 13. Implementasi CRM Pipeline
  - [-] 13.1 Buat CRM service
    - Implementasikan `src/lib/services/crm.service.ts`
    - Implementasikan CRUD pipeline dan kolom
    - Implementasikan perpindahan kartu (drag-and-drop logic)
    - Implementasikan batasan maksimal 20 kolom per pipeline
    - Implementasikan kolom default saat buat pipeline baru
    - Implementasikan filter dan pencarian
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6, 8.7_

  - [~] 13.2 Buat API routes untuk CRM
    - Implementasikan semua endpoint di `src/app/api/crm/`
    - Implementasikan validasi perpindahan kartu
    - Implementasikan penanganan hapus kolom berisi kartu
    - _Requirements: 8.1, 8.2, 8.3, 8.6, 8.7_

  - [~] 13.3 Tulis property tests untuk CRM
    - **Property 20: Batasan Kolom Pipeline CRM**
    - **Property 21: Perpindahan Kartu Pipeline Mencatat Timestamp**
    - **Property 22: Pencarian Pipeline Mengembalikan Hasil Yang Cocok**
    - **Validates: Requirements 8.1, 8.3, 8.6**

  - [~] 13.4 Buat UI halaman CRM Pipeline
    - Buat Kanban board dengan drag-and-drop (menggunakan dnd-kit atau react-beautiful-dnd)
    - Buat kartu kontak dengan info ringkas (nama, telepon, label, terakhir dihubungi)
    - Buat modal detail kontak (riwayat, catatan, follow-up)
    - Buat UI untuk tambah/edit/hapus/reorder kolom
    - Buat filter dan pencarian
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [ ] 14. Implementasi Auto Follow-Up dan Scheduling
  - [~] 14.1 Buat Scheduler service
    - Implementasikan `src/lib/services/scheduler.service.ts`
    - Buat BullMQ queue untuk follow-up jobs
    - Implementasikan trigger: no-reply days, stage change, specific date
    - Implementasikan pengecekan trigger setiap 1 jam (cron job)
    - Implementasikan retry 2x dengan interval 1 jam
    - Implementasikan penghentian rangkaian saat kontak membalas
    - Batasan: max 50 aturan aktif per user, max 10 langkah per rangkaian
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [~] 14.2 Buat API routes untuk Follow-Up
    - Implementasikan semua endpoint di `src/app/api/follow-ups/`
    - Implementasikan validasi aturan follow-up
    - Implementasikan pembatalan jadwal
    - _Requirements: 9.1, 9.6, 9.7_

  - [~] 14.3 Tulis property tests untuk Follow-Up
    - **Property 23: Batasan Aturan Follow-Up**
    - **Property 24: Pesan Masuk Menghentikan Rangkaian Follow-Up**
    - **Validates: Requirements 9.1, 9.5**

  - [~] 14.4 Buat UI halaman Follow-Up
    - Buat form pembuatan aturan follow-up (trigger type, template, langkah)
    - Buat daftar follow-up terjadwal (paginated, max 50 per halaman)
    - Buat tombol batalkan jadwal
    - Tampilkan status setiap follow-up (terjadwal, terkirim, gagal, dibatalkan)
    - _Requirements: 9.1, 9.6, 9.7_

- [~] 15. Checkpoint - Pastikan validator, CRM, dan follow-up berfungsi
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.


- [ ] 16. Implementasi Tasks dan Follow-Ups Manual
  - [~] 16.1 Buat Task service dan API routes
    - Implementasikan `src/lib/services/task.service.ts`
    - Buat API routes di `src/app/api/tasks/`
    - Implementasikan CRUD task dengan validasi (judul wajib, kontak wajib, due date >= hari ini)
    - Implementasikan filter berdasarkan status, prioritas, dan tanggal
    - Implementasikan logika status overdue (cek otomatis)
    - Implementasikan notifikasi pengingat pada pukul 08:00
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [~] 16.2 Tulis property tests untuk Tasks
    - **Property 25: Validasi Pembuatan Task**
    - **Property 26: Filter dan Pengurutan Daftar Task**
    - **Property 27: Derivasi Status Overdue Task**
    - **Validates: Requirements 10.1, 10.2, 10.5, 10.6**

  - [~] 16.3 Buat UI halaman Tasks
    - Buat halaman daftar task dengan filter (status, prioritas, tanggal)
    - Buat form pembuatan/edit task
    - Buat indikator visual untuk task overdue
    - Buat tombol tandai selesai
    - Tampilkan task terkait pada halaman detail kontak
    - _Requirements: 10.1, 10.2, 10.4, 10.5, 10.6, 10.7_

- [ ] 17. Implementasi Analytics dan Reporting
  - [~] 17.1 Buat Analytics service
    - Implementasikan `src/lib/services/analytics.service.ts`
    - Implementasikan kalkulasi metrik dashboard (total terkirim, delivery rate, read rate, reply rate, kontak aktif)
    - Implementasikan definisi kontak aktif (pesan dalam 30 hari terakhir)
    - Implementasikan filter periode waktu (hari ini, 7 hari, 30 hari, 90 hari, kustom)
    - Implementasikan data tren harian dan mingguan
    - Implementasikan perbandingan performa antar kampanye (sortable)
    - Implementasikan ekspor laporan ke PDF dan Excel
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [~] 17.2 Buat API routes untuk Analytics
    - Implementasikan `GET /api/analytics/dashboard`
    - Implementasikan `GET /api/analytics/campaigns`
    - Implementasikan `GET /api/analytics/trends`
    - Implementasikan `POST /api/analytics/export`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [~] 17.3 Tulis property tests untuk Analytics
    - **Property 8: Filter Periode Waktu Analytics**
    - **Property 9: Definisi Kontak Aktif**
    - **Property 10: Pengurutan Tabel Perbandingan Kampanye**
    - **Validates: Requirements 4.1, 4.2, 4.5**

  - [~] 17.4 Buat UI halaman Analytics dan Dashboard
    - Buat halaman dashboard dengan ringkasan metrik utama
    - Buat grafik tren pengiriman (line chart dan bar chart) dengan Recharts
    - Buat tabel perbandingan kampanye (sortable)
    - Buat filter periode waktu
    - Buat tombol ekspor laporan (PDF/Excel)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [~] 18. Checkpoint - Pastikan tasks, analytics, dan dashboard berfungsi
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.


- [ ] 19. Implementasi White-Label Branding
  - [~] 19.1 Buat Branding service dan API routes
    - Implementasikan `src/lib/services/branding.service.ts`
    - Buat API routes di `src/app/api/settings/branding/`
    - Implementasikan upload logo dengan validasi (PNG/JPG/SVG, max 2MB, max 512x512px)
    - Implementasikan upload favicon
    - Implementasikan update warna primer dan sekunder (format hex 6 digit)
    - Implementasikan update nama aplikasi (max 50 karakter)
    - Simpan pengaturan per user
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [~] 19.2 Tulis property tests untuk Branding
    - **Property 28: Validasi Pengaturan Branding**
    - **Validates: Requirements 11.2, 11.3**

  - [~] 19.3 Buat UI halaman Settings Branding
    - Buat halaman pengaturan white-label
    - Buat komponen upload logo dan favicon dengan preview
    - Buat color picker untuk warna primer dan sekunder
    - Buat input nama aplikasi
    - Terapkan branding dinamis pada header, sidebar, login page
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 20. Implementasi Tema Dark/Light Mode
  - [~] 20.1 Buat sistem tema dan preferensi pengguna
    - Implementasikan theme provider dengan Zustand store
    - Buat API route `PUT /api/settings/theme`
    - Implementasikan toggle dark/light mode tanpa reload halaman
    - Simpan preferensi tema ke database (persisten antar sesi)
    - Terapkan tema pada seluruh komponen UI
    - _Requirements: 12.4, 12.6_

  - [~] 20.2 Tulis property tests untuk Tema
    - **Property 29: Persistensi Preferensi Tema (Round-Trip)**
    - **Validates: Requirements 12.4**

- [ ] 21. Implementasi Layout dan Navigasi Responsif
  - [~] 21.1 Buat layout utama aplikasi
    - Buat sidebar navigasi dengan semua menu
    - Buat header dengan status WhatsApp dan info user
    - Implementasikan responsive layout (desktop, tablet, mobile)
    - Implementasikan hamburger menu untuk mobile (< 768px)
    - Pastikan area sentuh minimal 44x44px pada mobile
    - Implementasikan transisi halaman < 300ms
    - Buat loading indicator untuk operasi > 1 detik
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 22. Implementasi Dukungan dan Bantuan (Support)
  - [~] 22.1 Buat Support service dan API routes
    - Implementasikan `src/lib/services/support.service.ts`
    - Buat API routes di `src/app/api/support/`
    - Implementasikan pembuatan tiket dengan nomor referensi unik
    - Implementasikan daftar tiket per user dengan status
    - Buat data FAQ statis (minimal 10 entri)
    - Buat data dokumentasi bantuan per fitur
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.6_

  - [~] 22.2 Tulis property tests untuk Support
    - **Property 30: Keunikan Nomor Referensi Tiket Support**
    - **Validates: Requirements 13.3**

  - [~] 22.3 Buat UI halaman Support
    - Buat halaman pusat bantuan dengan navigasi per kategori fitur
    - Buat floating button untuk akses support dari semua halaman
    - Buat form pembuatan tiket
    - Buat halaman daftar tiket dengan status
    - Buat halaman FAQ
    - Implementasikan tooltip panduan untuk fitur pertama kali (max 150 karakter, dismissable)
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [~] 23. Checkpoint - Pastikan branding, tema, layout, dan support berfungsi
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.

- [ ] 24. Integrasi dan Wiring Akhir
  - [~] 24.1 Hubungkan semua komponen dan pastikan alur end-to-end
    - Pastikan navigasi antar halaman berfungsi
    - Pastikan Socket.IO events terhubung ke semua komponen real-time
    - Pastikan branding diterapkan secara global
    - Pastikan tema dark/light diterapkan konsisten
    - Pastikan error handling global berfungsi (structured error response)
    - Pastikan notifikasi toast muncul untuk semua operasi penting
    - _Requirements: 12.1, 12.3, 12.5, 12.6_

  - [~] 24.2 Implementasi Zustand stores untuk state management
    - Buat store untuk WhatsApp connection status
    - Buat store untuk blast/campaign progress
    - Buat store untuk notifikasi
    - Buat store untuk user preferences dan branding
    - _Requirements: 1.3, 2.5, 12.4_

  - [~] 24.3 Tulis integration tests untuk alur utama
    - Test alur autentikasi end-to-end
    - Test alur blast (buat → eksekusi → progress → selesai)
    - Test alur campaign (buat → jadwal → eksekusi → pause → resume)
    - Test alur import kontak (upload → preview → mapping → import)
    - Test alur CRM (buat pipeline → tambah kartu → pindah kartu)
    - **Validates: Requirements 1.1-1.7, 2.1-2.8, 3.1-3.8, 5.1-5.7, 8.1-8.8**

- [ ] 25. Restrukturisasi ke Monorepo (Two-App Setup)
  - [ ] 25.1 Konversi proyek menjadi monorepo dengan workspaces
    - Setup root `package.json` dengan npm workspaces (atau pnpm/turbo)
    - Pindahkan kode SaaS yang sudah ada ke `apps/saas/`
    - Buat `packages/types/` untuk tipe TypeScript bersama (PlanId, BillingCycle, PlanFeatures, PlanQuota, SubscriptionStatus, TransactionStatus)
    - Buat `packages/config/` dengan `plans.ts` (PLANS catalog, calculatePrice function)
    - Buat `packages/ui/` untuk komponen shadcn yang dipakai di kedua app
    - Setup TypeScript path aliases di root `tsconfig.base.json`
    - Pastikan `apps/saas` masih bisa di-build dan dijalankan tanpa regresi
    - _Requirements: 15.1_

  - [ ] 25.2 Buat aplikasi Landing Page baru
    - Inisialisasi `apps/landing/` dengan Next.js 14 App Router + Tailwind
    - Buat halaman utama dengan hero section, feature highlights (scraper, blast, validasi, CRM, follow-up), dan tombol CTA "Mulai Sekarang" dan "Konsultasi"
    - Buat halaman `/pricing` dengan toggle Bulanan/Tahunan dan dua kartu plan (Growth Rp 199K, Pro Rp 399K)
    - Implementasikan kalkulasi harga tahunan otomatis (×12 ×0.8 dengan label "-20%")
    - Tombol "Pilih Growth"/"Checkout Pro" mengarahkan ke `apps/saas` register page dengan query param `?plan=&cycle=`
    - Buat halaman `/faq` dengan minimal 5 entri pertanyaan umum
    - Pastikan responsif (desktop, tablet, mobile dengan area sentuh ≥44×44px)
    - Optimasi initial load: HTML+CSS payload <200KB, FCP <2 detik di koneksi 4G
    - _Requirements: 15.2, 15.3, 15.5, 15.6, 15.7_

- [ ] 26. Implementasi Subscription Plans dan Quota Enforcement
  - [ ] 26.1 Buat schema database Subscription dan Transaction
    - Tambahkan model Prisma: Subscription, Transaction, WebhookEvent
    - Tambahkan enum: PlanId, BillingCycle, SubscriptionStatus, TransactionStatus
    - Extend model Contact dengan field latitude, longitude, city, category, crmStage
    - Extend model User dengan relasi subscription dan transactions
    - Jalankan migrasi Prisma
    - _Requirements: 16.1, 17.5, 18.5_

  - [ ] 26.2 Buat Subscription service
    - Implementasikan `apps/saas/src/lib/services/subscription.service.ts`
    - Method: createTrialSubscription, upgrade, downgrade (scheduled), cancel, getActive, getUsageSummary
    - Implementasikan state machine subscription (TRIAL → TRIAL_EXPIRED → BLOCKED, ACTIVE → EXPIRED → BLOCKED)
    - Implementasikan logika downgrade tertunda (scheduledDowngradePlanId, berlaku akhir periode)
    - Cron job harian untuk transisi status berdasarkan tanggal (TRIAL→TRIAL_EXPIRED, ACTIVE→EXPIRED, dll)
    - _Requirements: 16.3, 16.3a, 16.7, 16.8, 17.7_

  - [ ] 26.3 Buat Quota service dan enforcement middleware
    - Implementasikan `quota.service.ts` dengan: assertCanAddContacts, hasFeature, getUsageSummary
    - Buat error class `QuotaExceededError`
    - Integrasikan `assertCanAddContacts` di setiap titik tulis kontak: contact.service.create, import.service.executeImport, scraper save-as-contact, validator import
    - Buat middleware `requireFeature(feature)` untuk endpoint Pro-only (white-label, CRM auto tasks)
    - Buat middleware `requireActiveSubscription` yang menolak mutasi (POST/PUT/DELETE) untuk status EXPIRED/TRIAL_EXPIRED, kecuali endpoint /api/billing/* dan /api/auth/*
    - _Requirements: 16.2, 16.4, 16.5_

  - [ ] 26.4 Buat API routes untuk Subscription
    - GET `/api/subscriptions/me` - subscription aktif + plan + kuota + fitur
    - POST `/api/subscriptions/upgrade` - upgrade plan (immediate setelah pembayaran)
    - POST `/api/subscriptions/downgrade` - schedule downgrade pada akhir periode
    - POST `/api/subscriptions/cancel` - batalkan subscription
    - GET `/api/subscriptions/usage` - ringkasan kuota
    - _Requirements: 16.6, 16.7, 16.8_

  - [x]* 26.5 Tulis property tests untuk Subscription dan Quota
    - **Property 37: Quota Enforcement Tidak Pernah Overflow**
    - **Property 38: Trial Lifecycle Determinism**
    - **Property 42: Read-Only Mode Memblokir Mutasi**
    - **Validates: Requirements 16.3, 16.3a, 16.4, 17.7**

- [ ] 27. Implementasi Billing dan Midtrans Integration
  - [ ] 27.1 Setup Midtrans SDK dan konfigurasi
    - Install `midtrans-client` SDK
    - Konfigurasi env: `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_ENVIRONMENT` (sandbox|production)
    - Buat singleton client di `lib/midtrans/client.ts`
    - _Requirements: 17.1_

  - [ ] 27.2 Buat Billing service
    - Implementasikan `billing.service.ts` dengan method: createCheckout, handleNotification, verifySignature, generateInvoicePDF
    - createCheckout: buat Transaction record (status PENDING), generate orderId `SUB-{userId}-{timestamp}`, panggil Midtrans Snap API, simpan snap_token
    - verifySignature: hitung SHA-512(orderId + statusCode + grossAmount + serverKey), bandingkan dengan timing-safe equal
    - handleNotification: idempotent berdasarkan transaction.status, tangani semua status (settlement, capture+accept, capture+challenge, pending, deny/cancel/expire/failure)
    - generateInvoicePDF: pakai library seperti pdfkit atau puppeteer
    - _Requirements: 17.1, 17.2, 17.3, 17.3a, 17.3b, 17.4_

  - [ ] 27.3 Buat webhook handler Midtrans
    - POST `/api/webhooks/midtrans`
    - Verifikasi signature SHA-512 sebelum processing
    - Simpan WebhookEvent untuk audit log (signatureValid, payload, processed)
    - Idempotency: cek transaction.status sebelum update; abaikan jika sudah PAID
    - Aktifkan subscription pada settlement/capture+accept; kirim email + invoice
    - Update status transaksi sesuai semua kasus Midtrans
    - _Requirements: 17.2, 17.3, 17.3a, 17.3b_

  - [ ] 27.4 Buat API routes Billing
    - POST `/api/subscriptions/checkout` - returns snapToken untuk Midtrans Snap.js di frontend
    - GET `/api/billing/transactions` - riwayat transaksi (paginated)
    - GET `/api/billing/transactions/:id/invoice` - unduh invoice PDF
    - _Requirements: 17.5_

  - [ ] 27.5 Buat halaman Billing & Subscription di SaaS
    - Halaman `/billing` menampilkan: plan aktif, billing cycle, tanggal perpanjangan, status pembayaran terakhir
    - Tombol "Upgrade ke Pro", "Ganti ke Tahunan", "Cancel Subscription"
    - Halaman riwayat pembayaran dengan tombol unduh invoice
    - Halaman checkout: integrasi Midtrans Snap.js untuk popup pembayaran
    - Banner status: trial countdown, expired warning, blocked notice
    - _Requirements: 16.6, 17.5_

  - [ ] 27.6 Buat email notification service
    - Email konfirmasi pembayaran (dengan attachment invoice PDF) dalam <5 menit setelah PAID
    - Email pengingat perpanjangan H-3 sebelum tanggal akhir
    - Email trial-akan-berakhir H-2
    - Pakai SMTP / SendGrid / Resend (sesuai infra)
    - _Requirements: 17.4, 17.6_

  - [x]* 27.7 Tulis property tests untuk Billing
    - **Property 36: Kalkulasi Harga Tahunan**
    - **Property 39: Idempotency Webhook Midtrans**
    - **Property 40: Verifikasi Signature Midtrans**
    - **Validates: Requirements 15.3, 17.2, 17.3**

- [ ] 28. Implementasi Analisis Pasar (Map View)
  - [ ] 28.1 Buat Market Analysis service
    - Implementasikan `market-analysis.service.ts` dengan: getSummary, getMarkers (clustered/individual), getTopCategories, getTopCities
    - Strategi clustering grid-based berdasarkan zoom level (4-7: 50km, 8-10: 10km, 11-13: 2km, 14+: individual)
    - SQL query untuk grid clustering dengan filter (category, city, crmStage, bbox)
    - Limit hasil maksimal 10.000 marker/cluster
    - _Requirements: 18.1, 18.2, 18.3, 18.5, 18.8_

  - [ ] 28.2 Buat API routes Market Analysis
    - GET `/api/analysis/summary` - metric cards
    - GET `/api/analysis/markers?zoom=&category=&city=&crmStage=&bbox=` - markers (clustered atau individual)
    - GET `/api/analysis/top-categories` - top 10
    - GET `/api/analysis/top-cities` - top 10
    - _Requirements: 18.1, 18.3, 18.5_

  - [ ] 28.3 Buat halaman Analisis Pasar
    - Buat halaman `/analysis` dengan layout: 4 metric cards (total kontak, ada koordinat, ber-kategori, rating rata-rata), peta interaktif, sidebar (Kategori teratas, Kota teratas, Legenda stage CRM)
    - Integrasi peta dengan library (Leaflet atau MapLibre GL) dengan marker clustering
    - Filter dropdowns: kategori, kota, stage CRM (perubahan filter update marker <1 detik)
    - Popup marker dengan tombol cepat: Detail, Blast, Chat, Maps
    - Warna marker konsisten dengan warna kolom CRM Pipeline
    - Tombol "Import kontak" → arahkan ke halaman Import
    - _Requirements: 18.1, 18.3, 18.4, 18.5, 18.6, 18.7_

  - [x]* 28.4 Tulis property tests untuk Map View
    - **Property 41: Filter Map View Konsisten**
    - **Validates: Requirements 18.3, 18.8**

- [ ] 29. Checkpoint - Pastikan SaaS subscription, billing, dan map view berfungsi
  - Pastikan semua tests pass dan integrasi Midtrans di sandbox berhasil

- [~] 30. Final Checkpoint - Pastikan seluruh sistem terintegrasi
  - Pastikan semua tests pass, tanyakan ke user jika ada pertanyaan.

## Notes

- Tasks yang ditandai dengan `*` bersifat opsional dan dapat dilewati untuk MVP lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Checkpoints memastikan validasi inkremental di setiap tahap
- Property tests memvalidasi properti kebenaran universal dari desain
- Unit tests memvalidasi contoh spesifik dan edge cases
- Bahasa implementasi: TypeScript (Next.js 14)
- Library property testing: fast-check
- Library unit testing: Vitest

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4"] },
    { "id": 4, "tasks": ["4.1"] },
    { "id": 5, "tasks": ["4.2", "4.3"] },
    { "id": 6, "tasks": ["4.4", "5.1"] },
    { "id": 7, "tasks": ["5.2", "5.3"] },
    { "id": 8, "tasks": ["5.4", "6.1"] },
    { "id": 9, "tasks": ["6.2", "6.3"] },
    { "id": 10, "tasks": ["6.4", "8.1", "9.1"] },
    { "id": 11, "tasks": ["8.2", "8.3", "9.2"] },
    { "id": 12, "tasks": ["8.4", "10.1"] },
    { "id": 13, "tasks": ["10.2", "10.3"] },
    { "id": 14, "tasks": ["10.4", "12.1"] },
    { "id": 15, "tasks": ["12.2", "12.3"] },
    { "id": 16, "tasks": ["12.4", "13.1"] },
    { "id": 17, "tasks": ["13.2", "13.3"] },
    { "id": 18, "tasks": ["13.4", "14.1"] },
    { "id": 19, "tasks": ["14.2", "14.3"] },
    { "id": 20, "tasks": ["14.4", "16.1"] },
    { "id": 21, "tasks": ["16.2", "16.3"] },
    { "id": 22, "tasks": ["17.1"] },
    { "id": 23, "tasks": ["17.2", "17.3"] },
    { "id": 24, "tasks": ["17.4", "19.1"] },
    { "id": 25, "tasks": ["19.2", "19.3", "20.1"] },
    { "id": 26, "tasks": ["20.2", "21.1", "22.1"] },
    { "id": 27, "tasks": ["22.2", "22.3"] },
    { "id": 28, "tasks": ["24.1", "24.2"] },
    { "id": 29, "tasks": ["24.3"] },
    { "id": 30, "tasks": ["25.1"] },
    { "id": 31, "tasks": ["25.2", "26.1"] },
    { "id": 32, "tasks": ["26.2", "26.3"] },
    { "id": 33, "tasks": ["26.4", "26.5", "27.1"] },
    { "id": 34, "tasks": ["27.2"] },
    { "id": 35, "tasks": ["27.3", "27.4", "27.7"] },
    { "id": 36, "tasks": ["27.5", "27.6", "28.1"] },
    { "id": 37, "tasks": ["28.2", "28.4"] },
    { "id": 38, "tasks": ["28.3"] }
  ]
}
```

# Addendum Persyaratan — Fitur Tambahan

Dokumen ini memperluas `requirements.md` (Persyaratan 1–18) dan pembaruan scraper (Persyaratan 6, lihat `requirements_new.md`). Berisi persyaratan baru hasil keputusan penambahan fitur: analisis visual lanjutan, kanban & workflow, serta template/auto-reply/click-to-chat. Semua dapat dibangun dengan stack client-side gratis (Recharts, dnd-kit, kalender) tanpa biaya pihak ketiga tambahan.

## Glosarium tambahan

- **Funnel**: Visualisasi tahapan konversi dari lead mentah hingga closing beserta persentase antar tahap
- **Atribusi_Sumber**: Pemetaan revenue/kontak ke sumber asalnya (kampanye atau job scraper)
- **WIP_Limit**: Batas maksimal jumlah kartu pada satu kolom pipeline
- **Spintax**: Sintaks variasi teks (mis. `{halo|hai}`) untuk menghasilkan varian pesan berbeda secara otomatis
- **Auto_Reply**: Balasan otomatis berbasis kata kunci terhadap pesan masuk
- **Click_To_Chat**: Tautan atau QR yang membuka percakapan WhatsApp langsung ke nomor workspace

---

### Persyaratan 19: Analisis Visual Lanjutan

**User Story:** Sebagai Pengguna, saya ingin melihat performa akuisisi secara visual, sehingga saya dapat memahami tahap mana yang bocor dan kampanye mana yang paling menguntungkan.

#### Kriteria Penerimaan

1. THE Platform SHALL menampilkan Funnel konversi dengan tahapan: lead mentah, disimpan (kontak), dihubungi, dibalas, dan closing, beserta jumlah dan persentase konversi antar tahap untuk periode yang dipilih
2. THE Platform SHALL menampilkan dashboard ROI per Kampanye yang menghitung total revenue dari Deal berstatus menang dibagi estimasi biaya, dan menampilkannya per Kampanye
3. THE Platform SHALL menampilkan Atribusi_Sumber dalam bentuk grafik yang menunjukkan jumlah kontak dan nilai Deal berdasarkan sumber (kampanye atau job scraper)
4. THE Platform SHALL menampilkan heatmap geografis kepadatan lead pada peta berdasarkan koordinat kontak
5. WHEN Pengguna mengubah rentang periode, THE Platform SHALL memperbarui seluruh visualisasi sesuai periode tanpa memuat ulang halaman
6. THE Platform SHALL menyediakan analisis "jam terbaik kirim" berdasarkan distribusi waktu balasan masuk historis

---

### Persyaratan 20: Kanban & Workflow Lanjutan

**User Story:** Sebagai Pengguna, saya ingin mengatur alur kerja secara visual dengan beberapa papan, sehingga saya dapat mengelola banyak proses penjualan dan tugas sekaligus.

#### Kriteria Penerimaan

1. THE Platform SHALL mendukung lebih dari satu Pipeline per Workspace, dan Pengguna dapat membuat, mengganti nama, dan menghapus Pipeline
2. THE Platform SHALL menampilkan total nilai Deal terbuka pada setiap kolom Pipeline (penjumlahan nilai kartu di kolom tersebut)
3. WHEN Pengguna menetapkan WIP_Limit pada sebuah kolom dan jumlah kartu melebihi batas, THE Platform SHALL menampilkan indikator peringatan pada kolom tersebut
4. THE Platform SHALL menyediakan papan task berbentuk kanban dengan kolom berdasarkan status task (belum selesai, dikerjakan, selesai) yang mendukung drag-and-drop
5. THE Platform SHALL menyediakan kalender kampanye yang menampilkan jadwal Blast, Kampanye, dan Follow_Up dalam tampilan bulanan dan mingguan
6. WHEN Pengguna memindahkan kartu antar kolom, THE Platform SHALL memperbarui status terkait dan mencatat timestamp perpindahan

---

### Persyaratan 21: Template & Variasi Pesan

**User Story:** Sebagai Pengguna, saya ingin menyimpan template pesan dan membuat variasinya, sehingga pesan saya konsisten namun tidak terdeteksi sebagai spam massal.

#### Kriteria Penerimaan

1. THE Platform SHALL menyediakan pustaka template pesan yang dapat dibuat, diedit, dihapus, dan dipakai ulang pada Blast, Kampanye, dan Follow_Up
2. THE Platform SHALL mendukung variabel personalisasi (mis. nama, kota) di dalam template
3. WHEN sebuah template berisi Spintax (mis. `{halo|hai|selamat pagi}`), THE Platform SHALL memilih salah satu varian secara acak per penerima saat pengiriman
4. THE Platform SHALL menampilkan pratinjau hasil render template (dengan variabel dan satu varian Spintax) sebelum pengiriman

---

### Persyaratan 22: Auto-Reply Inbox

**User Story:** Sebagai Pengguna, saya ingin balasan masuk tertentu dijawab otomatis, sehingga calon pelanggan mendapat respons cepat tanpa saya harus online.

#### Kriteria Penerimaan

1. WHEN Pengguna membuat aturan Auto_Reply, THE Platform SHALL menyimpan kata kunci pemicu dan pesan balasan yang akan dikirim
2. WHEN pesan masuk dari Kontak cocok dengan kata kunci pemicu sebuah aturan aktif, THE Platform SHALL mengirim pesan balasan yang sesuai melalui MessagingAccount terkait
3. THE Platform SHALL membatasi pengiriman Auto_Reply maksimal satu kali per Kontak per aturan dalam rentang waktu tertentu untuk menghindari loop
4. IF Kontak terdaftar pada Do-Not-Contact, THEN THE Platform SHALL tidak mengirim Auto_Reply ke Kontak tersebut

---

### Persyaratan 23: Click-to-Chat (Lead Masuk)

**User Story:** Sebagai Pengguna, saya ingin membuat tautan dan QR yang membuka percakapan WhatsApp, sehingga saya dapat mengumpulkan lead masuk dari iklan, kemasan, atau media sosial.

#### Kriteria Penerimaan

1. THE Platform SHALL menghasilkan Click_To_Chat berupa tautan dan QR yang mengarah ke nomor WhatsApp workspace dengan pesan pembuka opsional yang sudah terisi
2. WHEN seseorang memulai percakapan melalui Click_To_Chat, THE Platform SHALL membuat Kontak baru (jika belum ada) dengan sumber INBOUND dan membuka Conversation di inbox
3. THE Platform SHALL mencatat dari Click_To_Chat mana sebuah Kontak berasal untuk keperluan Atribusi_Sumber

---

## Fitur yang ditunda (fase berikutnya)

Berikut disepakati ditunda karena bersifat nice-to-have: A/B testing pesan blast, pembangun drip sequence visual, survei kepuasan via WA, dan leaderboard performa agen. Dapat diangkat menjadi persyaratan resmi pada iterasi berikutnya bila dibutuhkan.

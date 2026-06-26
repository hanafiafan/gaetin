# Dokumen Persyaratan (Requirements Document)

## Pendahuluan

Sistem ini adalah platform pemasaran berbasis WhatsApp yang modern dan dinamis, dirancang untuk membantu bisnis dalam mengelola kampanye pesan massal, menghasilkan leads dari Google Maps, mengelola hubungan pelanggan melalui CRM, serta menyediakan fitur otomasi lanjutan. Platform ini memiliki antarmuka yang responsif, integrasi yang kuat dengan WhatsApp API dan Google Maps, serta kemampuan white-label untuk kebutuhan branding.

Platform ini didistribusikan sebagai layanan **SaaS (Software as a Service)** dengan model langganan bulanan/tahunan. Sistem terdiri dari dua aplikasi web yang terpisah namun terintegrasi: (1) **Landing Page** publik untuk marketing, daftar harga, dan onboarding pengunjung; dan (2) **Aplikasi SaaS** yang merupakan dashboard inti untuk Pengguna yang sudah berlangganan. Fitur yang dapat diakses Pengguna ditentukan oleh Plan Langganan yang dipilih (Growth atau Pro), dengan batasan kuota pada penyimpanan kontak dan akses fitur-fitur tertentu.

## Glosarium

- **Platform**: Sistem website WhatsApp Marketing Platform secara keseluruhan
- **Pengguna**: Individu yang menggunakan Platform untuk mengelola kampanye pemasaran
- **Kontak**: Nomor telepon atau entitas pelanggan yang tersimpan dalam sistem
- **Kampanye**: Serangkaian pesan yang dikirim ke sekelompok Kontak dengan tujuan pemasaran tertentu
- **Lead**: Calon pelanggan potensial yang diperoleh dari proses scraping atau input manual
- **Pipeline**: Tahapan visual dalam CRM yang menunjukkan posisi Lead dalam proses penjualan
- **Blast**: Pengiriman pesan WhatsApp secara massal ke banyak Kontak sekaligus
- **Scraper**: Modul yang mengambil data bisnis dari Google Maps secara otomatis
- **Follow_Up**: Pesan tindak lanjut yang dikirim secara otomatis atau manual kepada Kontak
- **White_Label**: Kemampuan untuk mengubah branding Platform sesuai identitas bisnis Pengguna
- **CSV_Importer**: Modul yang memproses file CSV atau Excel untuk mengimpor data Kontak
- **Validator_WA**: Modul yang memverifikasi apakah nomor telepon terdaftar dan aktif di WhatsApp
- **Scheduler**: Modul yang mengatur jadwal pengiriman pesan dan Follow_Up secara otomatis
- **Dashboard**: Halaman utama Platform yang menampilkan ringkasan data dan metrik
- **Landing_Page**: Aplikasi web publik yang berisi materi marketing, halaman harga, FAQ, dan tombol konsultasi/checkout — terpisah dari Aplikasi SaaS
- **Aplikasi_SaaS**: Aplikasi web dashboard tempat Pengguna login dan menggunakan seluruh fitur platform setelah berlangganan
- **Plan**: Paket langganan yang menentukan batasan kuota dan akses fitur Pengguna; tersedia dua jenis: Growth dan Pro
- **Subscription**: Catatan langganan aktif Pengguna yang berisi Plan, periode penagihan (bulanan/tahunan), tanggal mulai, tanggal akhir, dan status (aktif, kedaluwarsa, dibatalkan)
- **Billing_Cycle**: Periode penagihan langganan, dapat berupa "monthly" (bulanan) atau "yearly" (tahunan dengan diskon 20%)
- **Quota**: Batasan numerik yang ditentukan Plan terhadap penggunaan fitur tertentu (contoh: jumlah kontak tersimpan)
- **Payment_Gateway**: Penyedia layanan pembayaran eksternal (Midtrans) yang memproses transaksi langganan, mendukung metode pembayaran kartu kredit/debit, virtual account bank, e-wallet (GoPay, OVO, DANA, ShopeePay), dan QRIS
- **Analisis_Pasar**: Modul visualisasi geografis yang menampilkan sebaran kontak/lead pada peta interaktif dengan filter kategori, kota, dan stage CRM

## Persyaratan

### Persyaratan 1: Koneksi WhatsApp

**User Story:** Sebagai Pengguna, saya ingin menghubungkan akun WhatsApp saya ke Platform, sehingga saya dapat mengirim dan menerima pesan melalui sistem.

#### Kriteria Penerimaan

1. WHEN Pengguna memilih opsi koneksi WhatsApp, THE Platform SHALL menampilkan QR code untuk proses pairing dalam waktu kurang dari 5 detik dengan masa berlaku QR code selama 60 detik
2. WHEN QR code berhasil dipindai oleh perangkat Pengguna, THE Platform SHALL menampilkan status "Terhubung" dan menyimpan sesi koneksi
3. WHILE sesi WhatsApp aktif, THE Platform SHALL menampilkan indikator status koneksi berwarna hijau pada Dashboard
4. IF koneksi WhatsApp terputus, THEN THE Platform SHALL menampilkan notifikasi kepada Pengguna dan mencoba reconnect otomatis sebanyak 3 kali dengan interval 10 detik
5. IF seluruh 3 percobaan reconnect otomatis gagal, THEN THE Platform SHALL menampilkan status "Terputus" dengan indikator berwarna merah pada Dashboard dan menyediakan tombol untuk reconnect manual
6. WHEN Pengguna memilih opsi disconnect, THE Platform SHALL memutuskan sesi WhatsApp dan menghapus data sesi dari server
7. IF QR code kedaluwarsa sebelum dipindai atau proses pemindaian gagal, THEN THE Platform SHALL menampilkan pesan error yang menjelaskan kegagalan dan menyediakan opsi untuk menghasilkan QR code baru

---

### Persyaratan 2: WhatsApp Blast - Pengiriman Pesan Massal

**User Story:** Sebagai Pengguna, saya ingin mengirim pesan WhatsApp secara massal ke banyak kontak sekaligus, sehingga saya dapat menjangkau banyak pelanggan dengan efisien.

#### Kriteria Penerimaan

1. WHEN Pengguna membuat pesan Blast baru, THE Platform SHALL menyediakan editor pesan dengan dukungan teks (maksimal 4.096 karakter), gambar (maksimal 5MB, format JPG/PNG), dokumen (maksimal 10MB, format PDF/DOC/XLSX), dan variabel personalisasi (nama, nomor telepon)
2. WHEN Pengguna memilih daftar Kontak sebagai penerima, THE Platform SHALL menampilkan jumlah total penerima (maksimal 10.000 Kontak per Blast) dan estimasi waktu pengiriman berdasarkan jumlah penerima dan jeda antar pesan
3. IF sesi WhatsApp tidak aktif saat Pengguna mengeksekusi Blast, THEN THE Platform SHALL menampilkan pesan error yang menginformasikan bahwa koneksi WhatsApp diperlukan dan mencegah eksekusi Blast
4. WHEN Pengguna mengeksekusi Blast dan sesi WhatsApp aktif, THE Platform SHALL mengirim pesan ke setiap Kontak dengan jeda acak antara 3-8 detik antar pesan untuk menghindari pemblokiran
5. WHILE proses Blast berjalan, THE Platform SHALL menampilkan progress bar yang diperbarui setiap 5 detik, menunjukkan jumlah pesan terkirim, gagal, dan tersisa
6. WHEN Pengguna memilih opsi berhenti pada Blast yang sedang berjalan, THE Platform SHALL menghentikan pengiriman pesan yang belum terkirim dan menandai Blast dengan status "Dihentikan"
7. IF pengiriman pesan ke suatu Kontak gagal, THEN THE Platform SHALL mencatat nomor yang gagal beserta alasan kegagalan dan melanjutkan pengiriman ke Kontak berikutnya
8. WHEN proses Blast selesai atau dihentikan, THE Platform SHALL menampilkan ringkasan hasil berupa jumlah terkirim, gagal, dan belum terkirim

---

### Persyaratan 3: Campaign Manager

**User Story:** Sebagai Pengguna, saya ingin mengelola kampanye pemasaran dalam satu tempat, sehingga saya dapat merencanakan, menjalankan, dan memantau beberapa kampanye secara terorganisir.

#### Kriteria Penerimaan

1. THE Platform SHALL menyediakan halaman daftar Kampanye yang menampilkan nama, status (draft, aktif, selesai, dijeda), tanggal dibuat, dan jumlah penerima
2. WHEN Pengguna membuat Kampanye baru, THE Platform SHALL menyediakan formulir dengan field wajib: nama kampanye (maksimal 100 karakter), daftar penerima (maksimal 10.000 penerima), dan template pesan; serta field opsional: deskripsi (maksimal 500 karakter) dan jadwal pengiriman
3. IF Pengguna mengirim formulir Kampanye baru dengan field wajib yang kosong atau melebihi batas karakter, THEN THE Platform SHALL menampilkan pesan error pada field yang bermasalah dan tidak menyimpan Kampanye
4. WHEN Pengguna menjadwalkan Kampanye dengan waktu minimal 5 menit dari waktu saat ini, THE Platform SHALL mengeksekusi pengiriman dalam toleransi 5 menit dari waktu yang dijadwalkan
5. IF eksekusi Kampanye terjadwal gagal karena koneksi WhatsApp terputus atau error sistem, THEN THE Platform SHALL mengubah status Kampanye menjadi "dijeda", menyimpan posisi pengiriman terakhir, dan menampilkan notifikasi kegagalan kepada Pengguna
6. WHILE Kampanye berstatus aktif, THE Platform SHALL menampilkan metrik berupa delivery rate, read rate, dan reply rate yang diperbarui setiap 30 detik
7. WHEN Pengguna memilih opsi jeda pada Kampanye aktif, THE Platform SHALL menghentikan pengiriman pesan yang belum terkirim dalam waktu maksimal 30 detik dan menyimpan posisi terakhir
8. WHEN Pengguna melanjutkan Kampanye yang dijeda, THE Platform SHALL melanjutkan pengiriman dari posisi terakhir yang tersimpan

---

### Persyaratan 4: Analytics dan Reporting

**User Story:** Sebagai Pengguna, saya ingin melihat laporan dan analitik dari kampanye saya, sehingga saya dapat mengukur efektivitas dan mengoptimalkan strategi pemasaran.

#### Kriteria Penerimaan

1. THE Dashboard SHALL menampilkan ringkasan metrik utama: total pesan terkirim, delivery rate, read rate, reply rate, dan jumlah kontak aktif, di mana kontak aktif didefinisikan sebagai Kontak yang menerima atau mengirim pesan dalam 30 hari terakhir
2. WHEN Pengguna memilih periode waktu tertentu, THE Platform SHALL memfilter semua data analitik sesuai rentang tanggal yang dipilih, dengan opsi periode preset (hari ini, 7 hari terakhir, 30 hari terakhir, 90 hari terakhir, kustom) dan default menampilkan data 30 hari terakhir
3. THE Platform SHALL menyediakan grafik visual (line chart dan bar chart) untuk tren pengiriman pesan harian dan mingguan
4. WHEN Pengguna memilih opsi ekspor laporan, THE Platform SHALL menghasilkan file laporan dalam format PDF atau Excel yang berisi metrik Kampanye (nama kampanye, total penerima, pesan terkirim, delivery rate, read rate, reply rate, tanggal mulai, tanggal selesai) dalam waktu maksimal 30 detik
5. THE Platform SHALL menampilkan perbandingan performa antar Kampanye dalam bentuk tabel yang dapat diurutkan berdasarkan metrik: delivery rate, read rate, reply rate, total pesan terkirim, dan tanggal Kampanye
6. IF proses ekspor laporan gagal atau melebihi batas waktu 30 detik, THEN THE Platform SHALL menampilkan pesan error yang menginformasikan kegagalan dan menyediakan opsi untuk mencoba kembali

---

### Persyaratan 5: Import Kontak dari CSV/Excel

**User Story:** Sebagai Pengguna, saya ingin mengimpor daftar kontak dari file CSV atau Excel, sehingga saya dapat dengan cepat menambahkan banyak kontak ke dalam sistem.

#### Kriteria Penerimaan

1. WHEN Pengguna mengunggah file CSV atau Excel (.csv, .xlsx, .xls), THE CSV_Importer SHALL memvalidasi bahwa file dapat diparsing dan memiliki minimal satu baris data dengan header, lalu menampilkan preview 10 baris pertama data dalam waktu kurang dari 5 detik
2. WHEN file berhasil divalidasi, THE CSV_Importer SHALL menyediakan antarmuka mapping kolom untuk mencocokkan kolom file dengan field Kontak (nama, nomor telepon, label), di mana nomor telepon wajib dipetakan dan field lainnya opsional
3. WHEN Pengguna mengkonfirmasi mapping dan memulai import, THE CSV_Importer SHALL memproses seluruh baris data dan menyimpan Kontak yang valid (memiliki nomor telepon non-kosong dengan format numerik 8-15 digit, boleh diawali tanda +) ke database
4. IF terdapat baris dengan nomor telepon kosong atau tidak memenuhi format numerik 8-15 digit, THEN THE CSV_Importer SHALL melewati baris tersebut dan mencatatnya dalam laporan error beserta nomor baris dan alasan penolakan
5. WHEN proses import selesai, THE CSV_Importer SHALL menampilkan ringkasan: jumlah berhasil diimpor, jumlah duplikat dilewati (berdasarkan kesamaan nomor telepon dengan Kontak yang sudah ada di database), dan jumlah error
6. IF file yang diunggah melebihi ukuran 10MB atau mengandung lebih dari 50.000 baris data, THEN THE CSV_Importer SHALL menolak file tersebut dan menampilkan pesan error yang menyatakan batas maksimum yang diperbolehkan
7. IF file yang diunggah tidak dapat diparsing atau memiliki ekstensi selain .csv, .xlsx, dan .xls, THEN THE CSV_Importer SHALL menampilkan pesan error yang menyatakan format file tidak didukung dan tidak melanjutkan proses import

---

### Persyaratan 6: Lead Generation - Google Maps Scraper

**User Story:** Sebagai Pengguna, saya ingin mengambil data bisnis dari Google Maps secara otomatis, sehingga saya dapat memperoleh leads potensial untuk kampanye pemasaran.

#### Kriteria Penerimaan

1. WHEN Pengguna memasukkan kata kunci pencarian dan lokasi, THE Scraper SHALL mengambil maksimal 500 data bisnis dari Google Maps yang sesuai dengan kata kunci dan lokasi yang dimasukkan
2. THE Scraper SHALL mengekstrak informasi berikut dari setiap hasil: nama bisnis, nomor telepon, alamat, rating, kategori bisnis, dan jumlah review, dengan field yang tidak tersedia ditandai sebagai "Tidak Tersedia"
3. WHEN Pengguna menerapkan filter lokasi berdasarkan kelurahan, THE Scraper SHALL hanya menampilkan hasil yang berada dalam wilayah kelurahan yang dipilih
4. WHEN Pengguna menerapkan filter rating, THE Scraper SHALL hanya menampilkan hasil dengan rating sama dengan atau lebih tinggi dari nilai yang ditentukan dalam rentang 1.0 hingga 5.0
5. WHEN Pengguna menerapkan filter kategori, THE Scraper SHALL hanya menampilkan hasil yang sesuai dengan kategori bisnis yang dipilih
6. WHEN proses scraping selesai, THE Scraper SHALL menampilkan jumlah total hasil yang ditemukan, jumlah duplikat yang dilewati, dan menyimpan data unik ke dalam daftar Lead
7. WHILE proses scraping berjalan, THE Scraper SHALL menampilkan indikator progress berupa jumlah data yang sudah diambil dan status proses (berjalan, selesai, atau gagal)
8. IF proses scraping gagal atau tidak menemukan hasil, THEN THE Scraper SHALL menampilkan pesan error yang menjelaskan penyebab kegagalan dan mempertahankan data yang sudah berhasil diambil sebelumnya

---

### Persyaratan 7: Validasi Nomor WhatsApp

**User Story:** Sebagai Pengguna, saya ingin memvalidasi apakah nomor telepon yang saya miliki terdaftar di WhatsApp, sehingga saya hanya mengirim pesan ke nomor yang aktif.

#### Kriteria Penerimaan

1. WHEN Pengguna memilih daftar Kontak atau Lead untuk divalidasi, THE Validator_WA SHALL memeriksa setiap nomor telepon apakah terdaftar di WhatsApp dengan maksimal 10.000 nomor per satu sesi validasi
2. WHEN validasi selesai untuk satu nomor, THE Validator_WA SHALL menandai nomor tersebut dengan status "Aktif WA" atau "Tidak Aktif WA"
3. WHILE proses validasi berjalan, THE Validator_WA SHALL menampilkan progress validasi berupa persentase dan jumlah nomor yang sudah diproses, diperbarui setiap kali satu nomor selesai divalidasi
4. THE Validator_WA SHALL memproses validasi dengan jeda acak antara 2-5 detik antar pengecekan nomor untuk menghindari rate limiting
5. WHEN validasi seluruh daftar selesai, THE Validator_WA SHALL menampilkan ringkasan: jumlah aktif, tidak aktif, dan tidak dapat diverifikasi
6. IF terjadi error saat memvalidasi nomor tertentu, THEN THE Validator_WA SHALL menandai nomor tersebut sebagai "Tidak Dapat Diverifikasi" dan melanjutkan ke nomor berikutnya
7. WHEN Pengguna memilih opsi batalkan selama proses validasi berjalan, THE Validator_WA SHALL menghentikan proses validasi, menyimpan hasil validasi yang sudah selesai, dan menampilkan ringkasan parsial
8. IF sesi WhatsApp tidak aktif saat Pengguna memulai validasi, THEN THE Validator_WA SHALL menampilkan pesan error yang menginformasikan bahwa koneksi WhatsApp diperlukan dan tidak memulai proses validasi

---

### Persyaratan 8: CRM Pipeline

**User Story:** Sebagai Pengguna, saya ingin mengelola leads dan pelanggan dalam pipeline visual, sehingga saya dapat melacak progres setiap lead dalam proses penjualan.

#### Kriteria Penerimaan

1. THE Platform SHALL menyediakan tampilan Pipeline dalam format Kanban board dengan kolom-kolom yang dapat dikustomisasi oleh Pengguna melalui operasi: menambah kolom baru, mengganti nama kolom, menghapus kolom, dan mengubah urutan kolom, dengan maksimal 20 kolom per Pipeline
2. WHEN Pengguna membuat Pipeline baru, THE Platform SHALL menyediakan minimal kolom default: "Lead Baru", "Dihubungi", "Negosiasi", "Closed Won", "Closed Lost"
3. WHEN Pengguna melakukan drag-and-drop kartu Kontak antar kolom, THE Platform SHALL memperbarui status Kontak sesuai kolom tujuan dan mencatat timestamp perpindahan
4. THE Platform SHALL menampilkan informasi ringkas pada setiap kartu Kontak: nama, nomor telepon, label, dan tanggal terakhir dihubungi
5. WHEN Pengguna mengklik kartu Kontak, THE Platform SHALL menampilkan detail lengkap termasuk riwayat percakapan, catatan, dan aktivitas Follow_Up
6. THE Platform SHALL menyediakan filter dan pencarian pada Pipeline berdasarkan nama, label, tanggal, dan status, dengan hasil pencarian ditampilkan dalam waktu kurang dari 2 detik
7. IF Pengguna menghapus kolom yang masih berisi kartu Kontak, THEN THE Platform SHALL menampilkan konfirmasi dan meminta Pengguna memilih kolom tujuan untuk memindahkan seluruh kartu sebelum penghapusan dilakukan
8. IF proses drag-and-drop gagal karena gangguan koneksi, THEN THE Platform SHALL mengembalikan kartu Kontak ke kolom asal dan menampilkan pesan error yang menjelaskan kegagalan

---

### Persyaratan 9: Auto Follow-Up dan Scheduling

**User Story:** Sebagai Pengguna, saya ingin mengatur pesan follow-up otomatis dan menjadwalkan pengiriman pesan, sehingga saya dapat menjaga komunikasi dengan leads tanpa harus mengirim manual.

#### Kriteria Penerimaan

1. WHEN Pengguna membuat aturan Follow_Up baru, THE Scheduler SHALL menyediakan opsi trigger: setelah X hari tidak ada balasan (X antara 1 hingga 90 hari), setelah perpindahan stage Pipeline, atau pada tanggal tertentu, dengan maksimal 10 langkah per rangkaian Follow_Up dan maksimal 50 aturan aktif per Pengguna
2. WHEN trigger Follow_Up terpenuhi, THE Scheduler SHALL mengirim pesan template yang telah ditentukan kepada Kontak yang bersangkutan
3. IF pengiriman pesan Follow_Up gagal, THEN THE Scheduler SHALL menandai status Follow_Up tersebut sebagai "Gagal" beserta alasan kegagalan, dan mencoba pengiriman ulang maksimal 2 kali dengan interval 1 jam sebelum menghentikan percobaan
4. WHILE aturan Follow_Up aktif, THE Scheduler SHALL memeriksa kondisi trigger setiap 1 jam dan mengeksekusi pengiriman yang memenuhi syarat
5. WHEN Kontak mengirim pesan masuk apapun ke Pengguna setelah Follow_Up terkirim, THE Scheduler SHALL menghentikan rangkaian Follow_Up otomatis untuk Kontak tersebut dan menandai status rangkaian sebagai "Dihentikan - Kontak Membalas"
6. THE Platform SHALL menyediakan halaman daftar Follow_Up terjadwal dengan maksimal 50 item per halaman yang menampilkan: Kontak tujuan, template pesan, waktu pengiriman, dan status (terjadwal, terkirim, gagal, dibatalkan)
7. WHEN Pengguna membatalkan Follow_Up terjadwal, THE Scheduler SHALL menghapus jadwal pengiriman dan menandai status sebagai "Dibatalkan"

---

### Persyaratan 10: Tasks dan Follow-Ups Manual

**User Story:** Sebagai Pengguna, saya ingin membuat dan mengelola tugas serta pengingat follow-up manual, sehingga saya tidak melewatkan aktivitas penting terkait leads.

#### Kriteria Penerimaan

1. WHEN Pengguna membuat task baru, THE Platform SHALL memvalidasi bahwa field judul (wajib, maksimal 100 karakter), Kontak terkait (wajib), dan tanggal jatuh tempo (wajib, minimal hari ini) terisi dengan benar, lalu menyimpan task dengan field: judul, deskripsi (opsional, maksimal 500 karakter), Kontak terkait, tanggal jatuh tempo, dan prioritas (tinggi, sedang, rendah; default: sedang)
2. THE Platform SHALL menampilkan daftar task dalam tampilan yang dapat difilter berdasarkan status (belum selesai, selesai, terlambat), prioritas, dan tanggal jatuh tempo
3. WHEN tanggal jatuh tempo task tercapai pada pukul 08:00 waktu lokal Pengguna, THE Platform SHALL menampilkan notifikasi pengingat kepada Pengguna yang berisi judul task dan nama Kontak terkait
4. WHEN Pengguna menandai task sebagai selesai, THE Platform SHALL memperbarui status task dan mencatat timestamp penyelesaian
5. THE Platform SHALL menampilkan task yang terkait dengan Kontak tertentu pada halaman detail Kontak tersebut, diurutkan berdasarkan tanggal jatuh tempo terdekat
6. IF tanggal jatuh tempo task telah terlewati dan task belum ditandai selesai, THEN THE Platform SHALL menandai task tersebut dengan status "terlambat" dan menampilkan indikator visual yang membedakannya dari task yang belum jatuh tempo
7. WHEN Pengguna memilih opsi edit pada task yang berstatus belum selesai, THE Platform SHALL mengizinkan perubahan pada judul, deskripsi, tanggal jatuh tempo, prioritas, dan Kontak terkait, lalu menyimpan perubahan tersebut

---

### Persyaratan 11: White-Label Branding

**User Story:** Sebagai Pengguna, saya ingin mengkustomisasi tampilan Platform dengan branding bisnis saya sendiri, sehingga Platform terlihat sebagai produk milik saya.

#### Kriteria Penerimaan

1. THE Platform SHALL menyediakan halaman pengaturan White_Label dengan opsi: logo, nama aplikasi, warna primer, warna sekunder, dan favicon
2. WHEN Pengguna mengunggah logo baru, THE Platform SHALL memvalidasi file (format: PNG, JPG, atau SVG; ukuran maksimal 2MB; dimensi maksimal 512x512 piksel) dan menampilkan logo tersebut pada header, halaman login, dan sidebar navigasi
3. WHEN Pengguna mengubah warna primer dan sekunder menggunakan input warna dalam format hex 6 digit, THE Platform SHALL menerapkan perubahan warna pada tombol, link, header, sidebar, dan elemen aksen di seluruh halaman antarmuka
4. WHEN Pengguna mengubah nama aplikasi (maksimal 50 karakter), THE Platform SHALL memperbarui judul browser tab, header aplikasi, dan teks pada halaman login
5. THE Platform SHALL menyimpan pengaturan White_Label dan menerapkannya pada setiap sesi Pengguna tanpa memerlukan konfigurasi ulang
6. IF Pengguna mengunggah file logo atau favicon dengan format tidak didukung atau ukuran melebihi batas maksimal, THEN THE Platform SHALL menolak unggahan, mempertahankan logo atau favicon sebelumnya, dan menampilkan pesan error yang menjelaskan batasan format dan ukuran yang diperbolehkan

---

### Persyaratan 12: Antarmuka Pengguna Modern dan Responsif

**User Story:** Sebagai Pengguna, saya ingin menggunakan Platform dengan antarmuka yang modern dan responsif, sehingga saya dapat mengakses semua fitur dengan nyaman dari perangkat apapun.

#### Kriteria Penerimaan

1. THE Platform SHALL menampilkan antarmuka menggunakan komponen UI yang konsisten di seluruh halaman, meliputi sidebar navigasi, header, dan card-based layout, dengan jarak antar elemen (spacing), tipografi, dan gaya visual (border-radius, shadow, warna) yang seragam
2. THE Platform SHALL menyesuaikan tata letak secara responsif untuk ukuran layar desktop (1024px ke atas), tablet (768px-1023px), dan mobile (di bawah 768px), di mana pada tampilan mobile sidebar navigasi berubah menjadi menu hamburger yang dapat dibuka/ditutup, dan elemen interaktif memiliki area sentuh minimal 44x44px
3. WHEN Pengguna berpindah antar halaman, THE Platform SHALL menampilkan transisi halaman dalam waktu kurang dari 300ms
4. THE Platform SHALL menyediakan mode gelap (dark mode) dan mode terang (light mode) yang dapat dipilih oleh Pengguna, dengan mode terang sebagai default, dan menyimpan preferensi mode yang dipilih secara persisten sehingga tetap berlaku pada sesi berikutnya
5. THE Platform SHALL menampilkan loading indicator pada setiap operasi yang membutuhkan waktu lebih dari 1 detik
6. WHEN Pengguna mengubah pilihan mode tampilan (gelap/terang), THE Platform SHALL menerapkan perubahan tema pada seluruh elemen antarmuka secara langsung tanpa memerlukan reload halaman

---

### Persyaratan 13: Dukungan dan Bantuan (Support)

**User Story:** Sebagai Pengguna, saya ingin mendapatkan bantuan dan dukungan saat mengalami kendala, sehingga saya dapat menyelesaikan masalah dengan cepat.

#### Kriteria Penerimaan

1. THE Platform SHALL menyediakan halaman pusat bantuan yang berisi dokumentasi penggunaan setiap fitur dengan struktur navigasi berdasarkan kategori fitur
2. THE Platform SHALL menyediakan widget live chat atau tiket support yang dapat diakses dari setiap halaman melalui tombol bantuan yang tetap terlihat (floating button)
3. WHEN Pengguna mengirim tiket support, THE Platform SHALL mencatat tiket dengan nomor referensi unik, menampilkan konfirmasi pengiriman berhasil, dan menampilkan estimasi waktu respons maksimal 1x24 jam kerja
4. THE Platform SHALL menyediakan halaman FAQ yang berisi minimal 10 entri jawaban yang dikelompokkan berdasarkan kategori fitur
5. WHEN Pengguna mengakses fitur untuk pertama kali, THE Platform SHALL menampilkan tooltip panduan maksimal 150 karakter yang menjelaskan fungsi utama fitur tersebut, dengan opsi dismiss yang menyembunyikan tooltip secara permanen untuk fitur tersebut
6. WHEN Pengguna membuka halaman daftar tiket support, THE Platform SHALL menampilkan seluruh tiket milik Pengguna beserta status masing-masing (terbuka, dalam proses, selesai) dan tanggal terakhir diperbarui

---

### Persyaratan 14: Keamanan dan Autentikasi

**User Story:** Sebagai Pengguna, saya ingin data dan akun saya terlindungi dengan baik, sehingga saya merasa aman menggunakan Platform.

#### Kriteria Penerimaan

1. WHEN Pengguna melakukan login dengan kredensial valid (email terdaftar dan password cocok), THE Platform SHALL memberikan akses dan menerbitkan token sesi dalam waktu kurang dari 3 detik
2. IF Pengguna melakukan login dengan email tidak terdaftar atau password tidak cocok, THEN THE Platform SHALL menolak akses dan menampilkan pesan error generik yang tidak mengungkapkan kredensial mana yang salah
3. THE Platform SHALL menyimpan password dalam bentuk hash menggunakan algoritma bcrypt dengan salt factor minimal 10
4. WHEN Pengguna gagal login sebanyak 5 kali berturut-turut, THE Platform SHALL mengunci akun selama 15 menit, mengirim notifikasi email ke Pengguna, dan mereset penghitung kegagalan setelah periode penguncian berakhir atau setelah login berhasil
5. THE Platform SHALL menggunakan token JWT dengan masa berlaku maksimal 24 jam untuk setiap sesi autentikasi
6. WHEN sesi JWT kedaluwarsa, THE Platform SHALL mengarahkan Pengguna ke halaman login dan menghapus token dari penyimpanan lokal
7. THE Platform SHALL mengenkripsi semua komunikasi data antara client dan server menggunakan protokol HTTPS/TLS
8. WHEN Pengguna membuat akun baru atau mengubah password, THE Platform SHALL memvalidasi bahwa password memiliki panjang minimal 8 karakter dan mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka
9. WHEN Pengguna memilih opsi logout, THE Platform SHALL menghapus token JWT dari penyimpanan lokal, membatalkan validitas token di server, dan mengarahkan Pengguna ke halaman login


---

### Persyaratan 15: Landing Page Publik

**User Story:** Sebagai calon pelanggan, saya ingin mengunjungi sebuah halaman publik yang menjelaskan produk, fitur, dan harga, sehingga saya dapat memahami nilai produk dan memulai proses berlangganan tanpa harus login terlebih dahulu.

#### Kriteria Penerimaan

1. THE Landing_Page SHALL merupakan aplikasi web terpisah dari Aplikasi_SaaS dengan domain atau subdomain berbeda, dan SHALL dapat diakses tanpa autentikasi
2. THE Landing_Page SHALL menampilkan minimal bagian berikut: hero section dengan ringkasan nilai produk, daftar fitur utama (scraper, blast, validasi, CRM, follow-up), halaman harga (Plan Growth dan Pro), FAQ minimal 5 entri, dan tombol "Konsultasi" yang membuka kontak WhatsApp atau formulir kontak
3. THE Landing_Page SHALL menyediakan toggle pilihan Billing_Cycle "Bulanan" dan "Tahunan" pada halaman harga, di mana pilihan "Tahunan" SHALL menampilkan label diskon "-20%" dan harga yang sudah dikalkulasi (harga bulanan × 12 × 0.8)
4. WHEN pengunjung memilih tombol "Pilih Growth" atau "Checkout Pro" pada halaman harga, THE Landing_Page SHALL mengarahkan pengunjung ke halaman registrasi pada Aplikasi_SaaS dengan parameter `?plan=growth&cycle=monthly` (atau parameter sesuai pilihan), dan parameter tersebut SHALL otomatis mengisi pilihan Plan dan Billing_Cycle pada formulir registrasi
5. THE Landing_Page SHALL responsif untuk ukuran layar desktop (>=1024px), tablet (768-1023px), dan mobile (<768px), dengan area sentuh tombol minimal 44x44 piksel pada mobile
6. WHEN pengunjung mengakses Landing_Page, THE Landing_Page SHALL memuat halaman utama (first contentful paint) dalam waktu kurang dari 2 detik pada koneksi 4G dengan ukuran payload HTML+CSS awal kurang dari 200KB
7. THE Landing_Page SHALL menampilkan tombol "Login" dan "Daftar" pada header yang masing-masing mengarahkan ke halaman login dan registrasi pada Aplikasi_SaaS

---

### Persyaratan 16: Subscription Plans dan Quota Enforcement

**User Story:** Sebagai operator bisnis, saya ingin memilih Plan langganan yang sesuai dengan skala usaha saya, sehingga saya hanya membayar untuk kapasitas yang saya butuhkan dan dapat melakukan upgrade saat usaha berkembang.

#### Kriteria Penerimaan

1. THE Platform SHALL menyediakan dua Plan: "Growth" dengan harga 199.000 IDR per bulan dan kuota maksimal 5.000 Kontak tersimpan, dan "Pro" dengan harga 399.000 IDR per bulan dan kuota Kontak tersimpan tanpa batas (unlimited)
2. THE Platform SHALL memberikan akses ke fitur berikut pada Plan Growth: Maps Scraper tanpa batas, WhatsApp Blast, Validasi Nomor WhatsApp, CRM Pipeline dasar, dan Tasks reminder; SHALL memberikan akses ke seluruh fitur Plan Growth ditambah CRM lanjutan dengan tasks otomatis, opsi white-label branding, dan prioritas dukungan teknis pada Plan Pro
3. WHEN Pengguna mendaftar akun baru tanpa memilih Plan, THE Platform SHALL memberikan trial Plan Growth aktif selama 7 hari dengan kuota 100 Kontak, dan SHALL menampilkan banner countdown sisa hari trial pada setiap halaman dashboard
3a. IF masa trial berakhir tanpa Pengguna melakukan checkout Plan berbayar, THEN THE Platform SHALL mengubah status Subscription menjadi "trial_expired" pada hari ke-8, mempertahankan akses read-only (lihat seluruh data tetapi tidak dapat membuat blast/campaign/import baru) hingga 14 hari setelahnya, dan setelah itu SHALL memblokir akses login dengan halaman "Trial Expired" yang berisi tombol checkout Plan
4. WHEN Pengguna pada Plan Growth mencoba menyimpan Kontak baru sehingga total Kontak tersimpan akan melebihi kuota 5.000, THE Platform SHALL menolak penyimpanan, menampilkan pesan "Kuota kontak Plan Growth tercapai (5.000/5.000). Upgrade ke Pro untuk penyimpanan tanpa batas.", dan menampilkan tombol "Upgrade ke Pro" yang mengarahkan ke halaman billing
5. WHEN Pengguna pada Plan Growth mencoba mengakses fitur yang hanya tersedia di Plan Pro (white-label branding atau CRM tasks otomatis), THE Platform SHALL menolak akses, menampilkan modal "Fitur Pro" yang menjelaskan fitur dan menampilkan tombol "Upgrade ke Pro"
6. THE Platform SHALL menampilkan halaman "Billing & Subscription" pada Aplikasi_SaaS yang berisi: nama Plan aktif, Billing_Cycle, harga per periode, tanggal mulai langganan, tanggal perpanjangan berikutnya, status pembayaran terakhir, dan tombol untuk upgrade/downgrade Plan dan ganti Billing_Cycle
7. WHEN Pengguna melakukan upgrade dari Growth ke Pro, THE Platform SHALL menerapkan akses fitur Pro segera setelah pembayaran terkonfirmasi (dalam waktu maksimal 5 menit setelah callback dari Payment_Gateway), tanpa memerlukan logout/login ulang
8. WHEN Pengguna melakukan downgrade dari Pro ke Growth dan jumlah Kontak tersimpan saat ini melebihi 5.000, THE Platform SHALL menampilkan peringatan yang menyebutkan jumlah Kontak yang melebihi kuota dan SHALL menjadwalkan downgrade berlaku pada akhir periode penagihan saat ini, sehingga Pengguna memiliki waktu untuk mengurangi jumlah Kontak

---

### Persyaratan 17: Billing dan Payment Processing

**User Story:** Sebagai Pengguna, saya ingin melakukan pembayaran langganan dengan aman melalui penyedia pembayaran terpercaya, sehingga saya dapat mengaktifkan dan memperpanjang langganan tanpa khawatir tentang keamanan transaksi.

#### Kriteria Penerimaan

1. WHEN Pengguna memilih Plan dan Billing_Cycle, THE Platform SHALL membuat catatan transaksi dengan status "pending", memanggil Midtrans Snap API untuk menghasilkan `snap_token` dan `redirect_url`, lalu mengarahkan Pengguna ke halaman Snap Midtrans dengan referensi unik `order_id` (format: `SUB-{userId}-{timestamp}`) dan nominal yang sesuai
2. WHEN Midtrans mengirim HTTP notification (callback) ke endpoint webhook `/api/webhooks/midtrans` dengan `transaction_status` bernilai `settlement` atau `capture` dengan `fraud_status` bernilai `accept`, THE Platform SHALL memverifikasi signature SHA-512 dengan formula `SHA512(order_id + status_code + gross_amount + ServerKey)`, memperbarui status transaksi menjadi "paid", dan mengaktifkan Subscription Pengguna dalam waktu kurang dari 5 menit
3. IF signature SHA-512 dari Midtrans tidak cocok atau `order_id` tidak ditemukan, THEN THE Platform SHALL menolak callback dengan HTTP 400 dan mencatat seluruh payload callback ke audit log untuk investigasi
3a. WHEN Midtrans mengirim callback dengan `transaction_status` bernilai `pending` (VA/QRIS belum dibayar), `deny`, `cancel`, `expire`, atau `failure`, THE Platform SHALL memperbarui status transaksi sesuai (`pending`, `failed`, `cancelled`, atau `expired`) dengan HTTP 200 tanpa mengaktifkan Subscription, dan menunggu callback final berikutnya jika status `pending`
3b. WHEN Midtrans mengirim callback dengan `transaction_status` bernilai `capture` dan `fraud_status` bernilai `challenge`, THE Platform SHALL menyimpan status transaksi sebagai "challenge" tanpa mengaktifkan Subscription, dan SHALL mengaktifkan Subscription hanya setelah menerima callback final dengan `fraud_status` bernilai `accept`
4. THE Platform SHALL mengirim email konfirmasi pembayaran ke Pengguna dalam waktu kurang dari 5 menit setelah pembayaran terkonfirmasi, yang berisi: nama Plan, Billing_Cycle, nominal, periode aktif, dan link unduh invoice PDF
5. THE Platform SHALL menyediakan halaman "Riwayat Pembayaran" yang menampilkan seluruh transaksi Pengguna dengan kolom: tanggal, Plan, Billing_Cycle, nominal, status (paid, pending, failed, refunded), dan tombol unduh invoice
6. WHEN Subscription Pengguna mendekati tanggal perpanjangan (3 hari sebelum tanggal akhir), THE Platform SHALL mengirim email pengingat dengan link untuk memperpanjang langganan
7. IF Subscription Pengguna kedaluwarsa tanpa perpanjangan, THEN THE Platform SHALL mengubah status Subscription menjadi "expired" pada tanggal akhir, mempertahankan akses login dengan mode read-only selama 30 hari (Pengguna dapat melihat semua data dan mengunduh ekspor, tetapi semua tombol aksi seperti "Buat Blast", "Eksekusi Campaign", "Import Kontak", "Mulai Scraping", "Mulai Validasi" SHALL non-aktif dan menampilkan tooltip "Subscription kedaluwarsa - perpanjang untuk mengaktifkan"), dan setelah 30 hari SHALL memblokir akses login dengan menampilkan halaman "Subscription Expired" yang berisi tombol perpanjangan
8. IF pembayaran gagal atau dibatalkan oleh Pengguna pada halaman Payment_Gateway, THEN THE Platform SHALL mempertahankan status transaksi sebagai "failed" atau "cancelled", tidak mengaktifkan Subscription, dan menampilkan pesan kepada Pengguna dengan tombol untuk mencoba pembayaran ulang
9. THE Platform SHALL menyimpan rincian transaksi minimal 5 tahun untuk kepatuhan audit dan SHALL tidak menyimpan data sensitif kartu (PAN, CVV) — semua data kartu dikelola sepenuhnya oleh Payment_Gateway

---

### Persyaratan 18: Analisis Pasar (Map View Geografis)

**User Story:** Sebagai Pengguna, saya ingin melihat sebaran geografis kontak dan lead saya pada peta interaktif, sehingga saya dapat memahami konsentrasi pasar berdasarkan lokasi dan merencanakan kampanye yang lebih bertarget.

#### Kriteria Penerimaan

1. THE Platform SHALL menyediakan halaman "Analisis Pasar" yang menampilkan kartu metrik ringkas (total kontak, jumlah dengan koordinat, jumlah berkategori, rating rata-rata) dan peta interaktif sebaran kontak/lead dengan marker berkluster (clustering) ketika zoom out
2. WHEN Pengguna mengakses halaman Analisis Pasar dengan dataset kurang dari atau sama dengan 10.000 titik dengan koordinat valid, THE Platform SHALL merender peta dan seluruh marker dalam waktu kurang dari 3 detik
3. THE Platform SHALL menampilkan dropdown filter "Semua kategori", "Semua kota", dan "Semua stage CRM" pada halaman Analisis Pasar, di mana setiap perubahan filter SHALL memperbarui marker yang ditampilkan dalam waktu kurang dari 1 detik tanpa memuat ulang halaman
4. WHEN Pengguna mengklik marker pada peta, THE Platform SHALL menampilkan popup detail kontak yang berisi: nama, nomor telepon, alamat, kategori, status WhatsApp, dan tombol cepat: "Detail" (ke halaman kontak), "Blast" (tambah ke blast), "Chat" (buka WhatsApp), dan "Maps" (buka di Google Maps eksternal)
5. THE Platform SHALL menampilkan panel sidebar pada halaman Analisis Pasar yang berisi daftar "Kategori teratas" (10 kategori dengan jumlah kontak terbanyak beserta bar visualisasi proporsi) dan daftar "Kota teratas" (10 kota dengan jumlah kontak terbanyak)
6. THE Platform SHALL menampilkan legenda warna marker pada halaman Analisis Pasar yang merepresentasikan stage CRM (Baru, Dihubungi, Tertarik, Negosiasi, Menang, Kalah) dengan warna konsisten dengan warna kolom CRM Pipeline
7. WHEN Pengguna memilih tombol "Import kontak" pada halaman Analisis Pasar, THE Platform SHALL mengarahkan Pengguna ke halaman Import Kontak (CSV/Excel) sesuai Persyaratan 5
8. IF dataset melebihi 10.000 titik, THEN THE Platform SHALL menerapkan strategi clustering server-side berbasis grid geografis (membagi area peta menjadi grid sesuai level zoom dan mengembalikan satu marker agregasi per grid yang berisi jumlah titik di dalamnya), membatasi marker yang ditampilkan menjadi maksimal 10.000 grid-marker, dan menampilkan label "10.000 titik ditampilkan" beserta informasi total titik aktual

export interface EditorialPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  art: string;
  sections: { title: string; paragraphs: string[] }[];
}
export const editorialPosts: EditorialPost[] = [
  {
    slug: "riset-prospek-lokal-google-maps",
    title: "Bukan sekadar banyak kontak. Temukan prospek yang tepat.",
    excerpt:
      "Cara menyusun riset bisnis lokal agar daftar prospek lebih relevan dan mudah ditindaklanjuti.",
    category: "Riset prospek",
    readTime: 4,
    art: "FIND\nYOUR PEOPLE.",
    sections: [
      {
        title: "Mulai dari siapa yang ingin Anda bantu",
        paragraphs: [
          "Daftar prospek yang baik dimulai dari pertanyaan sederhana: bisnis seperti apa yang paling terbantu oleh penawaran Anda? Jika Anda memasok kemasan minuman, kedai kopi independen mungkin lebih relevan daripada seluruh bisnis makanan di satu kota.",
          "Tulis kategori, wilayah, dan satu kebutuhan yang ingin Anda pecahkan. Contoh: kedai kopi di Bandung yang membutuhkan kemasan untuk pesanan dibawa pulang. Kriteria ini membantu tim menilai hasil secara konsisten.",
        ],
      },
      {
        title: "Pecah riset menjadi area yang jelas",
        paragraphs: [
          "Gunakan kata kunci yang spesifik dan pisahkan wilayah pencarian. Di Hellens, buat job dengan nama yang menjelaskan kategori dan area, lalu jalankan pengambilan data melalui ekstensi Google Maps.",
          "Hasil pencarian bergantung pada informasi publik dan tampilan Google Maps. Tidak semua bisnis mencantumkan nomor telepon, website, atau informasi yang lengkap. Perlakukan hasil sebagai bahan riset yang perlu diperiksa.",
        ],
      },
      {
        title: "Tinjau sebelum menyimpan",
        paragraphs: [
          "Periksa nama, alamat, website dan nomor. Dua cabang dengan nama sama bisa merupakan peluang yang berbeda, sementara dua entri mirip dapat merujuk pada lokasi yang sama. Gunakan konteks alamat untuk menentukannya.",
          "Simpan kontak yang sesuai dengan kriteria, bukan seluruh hasil hanya karena tersedia. Kualitas daftar membuat personalisasi dan tindak lanjut jauh lebih ringan.",
        ],
      },
      {
        title: "Berikan satu langkah berikutnya",
        paragraphs: [
          "Setelah tersimpan, tentukan tindakan: pelajari website, validasi nomor, atau masukkan ke tahap awal CRM jika paket mendukung. Beri tugas kepada anggota tim yang akan menangani prospek tersebut.",
          "Riset selesai ketika ada keputusan yang bisa ditindaklanjuti. Daftar panjang tanpa pemilik dan langkah berikutnya mudah terlupakan.",
        ],
      },
    ],
  },
  {
    slug: "pesan-pembuka-yang-relevan",
    title: "Pesan pembuka yang terasa seperti percakapan.",
    excerpt:
      "Susun perkenalan singkat, kontekstual, dan memberi penerima ruang untuk menentukan langkah berikutnya.",
    category: "Komunikasi",
    readTime: 4,
    art: "SAY HELLO.\nMEAN IT.",
    sections: [
      {
        title: "Mulai dari konteks, bukan katalog",
        paragraphs: [
          "Penerima perlu tahu siapa Anda dan mengapa menghubunginya. Perkenalan yang jelas lebih mudah dipahami daripada paragraf panjang berisi seluruh layanan.",
          "Sebutkan konteks yang memang sudah Anda periksa. Hindari membuat kesan seolah pernah berinteraksi jika belum. Informasi publik membantu riset, tetapi tidak otomatis berarti penerima ingin menerima promosi.",
        ],
      },
      {
        title: "Satu pesan, satu tujuan",
        paragraphs: [
          "Contoh kerangka: “Halo, saya Rani dari Studio A. Kami membantu kedai menyiapkan foto menu. Apakah boleh saya kirim contoh pekerjaan yang relevan?” Sesuaikan identitas, konteks dan penawaran dengan kondisi nyata.",
          "Tujuan pesan pertama bisa sesederhana meminta izin melanjutkan. Tidak semua percakapan harus langsung berujung pada presentasi atau transaksi.",
        ],
      },
      {
        title: "Personalisasi tetap perlu ditinjau",
        paragraphs: [
          "Template Hellens mendukung variabel seperti nama dan kota. Sebelum menjalankan kampanye, periksa data kontak agar sapaan tidak kosong atau keliru.",
          "Gunakan kelompok penerima kecil dan relevan untuk mengevaluasi pesan. Jika penerima menolak atau meminta berhenti, hormati permintaan tersebut dan gunakan daftar Do-Not-Contact.",
        ],
      },
      {
        title: "Baca respons, bukan hanya jumlah terkirim",
        paragraphs: [
          "Status terkirim memberi informasi teknis, bukan bukti bahwa penawaran menarik. Perhatikan kualitas balasan, pertanyaan yang muncul dan apakah waktu kontak sesuai.",
          "Catat respons di alur kerja tim. Percakapan yang ditangani dengan jelas lebih berguna daripada mengirim pesan lanjutan tanpa memahami konteks sebelumnya.",
        ],
      },
    ],
  },
  {
    slug: "pipeline-crm-untuk-tim-kecil",
    title: "CRM sederhana yang benar-benar dipakai tim.",
    excerpt:
      "Buat tahap penjualan yang jelas, tentukan pemilik, dan selalu sisakan langkah berikutnya.",
    category: "CRM & tim",
    readTime: 5,
    art: "LESS CHAOS.\nMORE CLARITY.",
    sections: [
      {
        title: "Tahap adalah kondisi, bukan hiasan",
        paragraphs: [
          "Pipeline membantu jika setiap anggota tim memahami arti kolomnya. “Prospek baru” berarti belum ditinjau atau dihubungi. “Sudah dihubungi” berarti ada perkenalan yang tercatat. Tentukan definisi yang sesuai dengan proses bisnis Anda.",
          "Tidak perlu membuat terlalu banyak tahap. Mulai dengan beberapa kondisi yang benar-benar mengubah tindakan tim, lalu evaluasi setelah digunakan.",
        ],
      },
      {
        title: "Pastikan satu kontak punya penanggung jawab",
        paragraphs: [
          "Ketika semua orang merasa orang lain akan membalas, peluang bisa terlewat. Gunakan tugas untuk menentukan siapa yang perlu bertindak dan kapan.",
          "Simpan konteks penting: kebutuhan yang disampaikan, materi yang sudah dikirim, dan kapan penerima meminta dihubungi kembali. Hindari mencatat informasi yang tidak diperlukan untuk pekerjaan.",
        ],
      },
      {
        title: "Pindahkan kartu setelah ada perubahan nyata",
        paragraphs: [
          "Di Hellens, kartu dapat dipindahkan melalui pipeline dan tahap kontak disinkronkan. Gunakan perpindahan untuk mencerminkan perkembangan, bukan sekadar agar papan terlihat ramai.",
          "Jika respons belum datang, catat tindak lanjut yang wajar. Jangan menganggap pesan terkirim sama dengan prospek tertarik.",
        ],
      },
      {
        title: "Jadikan tinjauan mingguan singkat dan konkret",
        paragraphs: [
          "Tinjau kontak yang terlalu lama di satu tahap. Tanyakan: informasi apa yang kurang, siapa pemiliknya, dan tindakan apa yang diperlukan? Pilih beberapa hal yang bisa diselesaikan minggu ini.",
          "Pipeline yang berguna membuat tim lebih mudah mengambil keputusan. Bila ada kolom yang tidak pernah mengubah tindakan, sederhanakan definisinya.",
        ],
      },
    ],
  },
  {
    slug: "memahami-kredit-dan-hasil-scraping",
    title: "Pahami kredit, batas penggunaan, dan hasil yang tersedia.",
    excerpt:
      "Panduan membaca kuota agar aktivitas riset dan komunikasi bisa direncanakan dengan lebih baik.",
    category: "Panduan produk",
    readTime: 4,
    art: "PLAN SMART.\nGROW STEADY.",
    sections: [
      {
        title: "Kredit dan kuota adalah dua hal berbeda",
        paragraphs: [
          "Kredit digunakan untuk aksi tertentu seperti menyimpan lead, validasi dan pengiriman. Kuota mengatur batas aktivitas, misalnya jumlah job scraping per bulan dan jumlah hasil maksimal dalam satu job.",
          "Memiliki kredit tidak berarti setiap batas kuota hilang. Periksa paket aktif dan saldo di workspace sebelum merencanakan aktivitas dalam jumlah besar.",
        ],
      },
      {
        title: "Hasil maksimal bukan jumlah yang dijanjikan",
        paragraphs: [
          "Batas hasil per job menunjukkan kapasitas, bukan jaminan jumlah bisnis yang ditemukan. Lokasi, kategori, data publik dan respons website dapat memengaruhi hasil.",
          "Email dicari melalui website bisnis. Website yang tidak menampilkan email publik atau membutuhkan JavaScript dapat menghasilkan pencarian tanpa email. Ini berbeda dari kegagalan menyimpan data.",
        ],
      },
      {
        title: "Periksa status sebelum mencoba ulang",
        paragraphs: [
          "Jika koneksi terputus saat pengiriman, statusnya bisa belum pasti. Periksa penjelasan yang tampil dan kondisi di provider sebelum membuat pengiriman baru.",
          "Untuk scraping melalui ekstensi, pastikan koneksi kembali tersedia dan ikuti pesan pemulihan di layar. Jangan menghapus ekstensi ketika masih ada batch yang belum terkirim.",
        ],
      },
      {
        title: "Rencanakan berdasarkan kebutuhan nyata",
        paragraphs: [
          "Mulai dengan riset yang terarah dan daftar kontak yang sudah ditinjau. Hitung kebutuhan penyimpanan, validasi dan komunikasi secara terpisah agar rencana penggunaan lebih jelas.",
          "Halaman harga membaca konfigurasi paket sistem. Rincian saldo, paket aktif dan transaksi tetap dapat Anda periksa di workspace.",
        ],
      },
    ],
  },
];

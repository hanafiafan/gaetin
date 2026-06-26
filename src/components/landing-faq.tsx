"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    q: "Apakah perlu install aplikasi tambahan untuk mulai?",
    a: "Tidak perlu. Dashboard Gaetin berjalan sepenuhnya di browser. Untuk fitur scraping otomatis di Google Maps, Anda perlu menginstall ekstensi Chrome Gaetin — tersedia gratis, bisa diunduh langsung dari menu Scraper di dashboard.",
  },
  {
    q: "Bagaimana cara kerja scraping lead di Google Maps?",
    a: "Gaetin menggunakan ekstensi Chrome yang terintegrasi dengan Google Maps. Cukup atur kata kunci pencarian (contoh: 'toko baju Surabaya'), area, dan jumlah hasil yang diinginkan. Ekstensi akan berjalan otomatis dan menyimpan data bisnis — nama, nomor, alamat, kategori, rating, jam buka — langsung ke database lead Anda.",
  },
  {
    q: "Apakah data scraping legal dan aman?",
    a: "Data yang dikumpulkan adalah informasi publik yang tersedia di Google Maps, seperti nama bisnis, alamat, nomor telepon, dan jam operasional. Penggunaan data bisnis publik untuk keperluan marketing B2B adalah praktik yang umum. Anda tetap bertanggung jawab memastikan penggunaan data sesuai regulasi privasi yang berlaku di wilayah Anda.",
  },
  {
    q: "Apa itu kredit dan bagaimana cara kerjanya?",
    a: "Kredit adalah satuan pemakaian fitur berbasis aksi. Setiap lead yang disimpan ke kontak menggunakan 1 kredit, dan setiap validasi nomor WhatsApp juga 1 kredit. Semua paket sudah termasuk kredit bulanan otomatis. Jika kredit habis sebelum akhir bulan, Anda bisa membeli paket top-up kapan saja dari halaman Tagihan tanpa perlu ganti paket.",
  },
  {
    q: "Apakah ada periode trial atau uji coba gratis?",
    a: "Ya. Setiap akun baru mendapatkan 100 kredit gratis untuk mencoba semua fitur platform — termasuk scraping, blast WhatsApp, CRM pipeline, dan validasi nomor. Tidak perlu memasukkan kartu kredit untuk mulai. Kredit trial bisa dipakai sebelum memutuskan berlangganan.",
  },
  {
    q: "Berapa banyak nomor WhatsApp yang bisa dihubungkan?",
    a: "Anda bisa menghubungkan beberapa akun WhatsApp sekaligus dalam satu workspace. Sistem mendukung beberapa provider (Baileys, Gateway, dan Cloud API), sehingga tim bisa membagi beban pengiriman pesan dan menghindari batas harian dari satu nomor.",
  },
  {
    q: "Apakah Gaetin cocok untuk tim dengan beberapa pengguna?",
    a: "Ya. Setiap workspace mendukung beberapa anggota tim dengan role yang berbeda: Owner, Admin, dan Agent. Owner bisa mengatur siapa yang punya akses ke fitur mana — misalnya Agent hanya bisa akses Inbox dan Tugas, sementara Admin bisa mengelola semua fitur.",
  },
  {
    q: "Bisakah saya upgrade, downgrade, atau membatalkan paket?",
    a: "Ya, semuanya fleksibel. Upgrade paket berlaku langsung dan kredit baru ditambahkan seketika. Downgrade atau pembatalan berlaku di akhir periode billing berjalan. Tidak ada kontrak jangka panjang — Anda berlangganan bulanan dan bebas berhenti kapan saja.",
  },
  {
    q: "Bagaimana keamanan dan privasi data workspace saya?",
    a: "Setiap workspace berjalan dalam isolasi penuh — data satu workspace tidak bisa diakses oleh workspace lain. Database dihosting di Supabase (PostgreSQL) dengan enkripsi data at-rest dan koneksi SSL. Akses admin platform hanya dipegang oleh pemilik sistem dan tidak dibagikan ke pihak ketiga.",
  },
  {
    q: "Apakah ada diskon untuk pembayaran tahunan?",
    a: "Ya. Pilih siklus billing tahunan dan dapatkan diskon 20% dari total biaya bulanan — setara 2,4 bulan gratis. Pilihan ini tersedia di halaman Tagihan saat melakukan upgrade atau perpanjangan paket.",
  },
];

export default function LandingFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2.5">
      {FAQ_ITEMS.map((item, i) => (
        <div
          key={i}
          className={cn(
            "overflow-hidden rounded-2xl border transition-all duration-200",
            open === i
              ? "border-primary/35 bg-primary/[0.07]"
              : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
          )}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-start gap-4 p-5 text-left"
          >
            <span className="flex-1 text-sm font-bold leading-6 text-white">{item.q}</span>
            <ChevronDown
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200",
                open === i && "rotate-180 text-primary",
              )}
            />
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-200",
              open === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <p className="px-5 pb-5 text-sm leading-7 text-slate-300">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

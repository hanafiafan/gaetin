import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
export const metadata: Metadata = {
  title: "Panduan mulai — Hellens",
  description:
    "Pasang ekstensi, temukan prospek dan mulai menggunakan Hellens langkah demi langkah.",
  alternates: { canonical: "/panduan" },
};
export default function GuidePage() {
  return (
    <PublicShell>
      <main id="main-content">
        <section className="pub-page-hero">
          <div className="pub-wrap">
            <span className="pub-eyebrow">HELLENS / START HERE</span>
            <h1>
              LANGKAH PERTAMA.
              <br />
              <span className="pub-orange-text">DIBUAT MUDAH.</span>
            </h1>
            <p>
              Dari akun baru sampai daftar prospek pertama. Panduan singkat
              untuk mulai dengan arah yang jelas.
            </p>
          </div>
        </section>
        <div className="pub-wrap pub-section pub-guide-grid">
          <nav className="pub-guide-nav" aria-label="Daftar isi panduan">
            {[
              ["akun", "01 · Buat akun"],
              ["ekstensi", "02 · Pasang ekstensi"],
              ["prospek", "03 · Temukan prospek"],
              ["komunikasi", "04 · Kelola komunikasi"],
              ["kendala", "05 · Saat ada kendala"],
            ].map(([id, label]) => (
              <a key={id} href={"#" + id}>
                {label}
              </a>
            ))}
          </nav>
          <article className="pub-reading">
            <section id="akun">
              <h2>01. Siapkan workspace Anda.</h2>
              <p>
                Buat akun dengan email atau gunakan Google jika opsi tersedia.
                Setelah masuk, kenali halaman ringkasan, saldo kredit, paket
                aktif dan menu Pengaturan.
              </p>
              <p>
                Gunakan nama workspace yang mudah dikenali tim. Setiap anggota
                perlu memakai akun sendiri agar pembagian peran dan pekerjaan
                lebih jelas.
              </p>
              <Link href="/register" className="pub-button pub-button-dark">
                Buat akun gratis <ArrowUpRight size={18} />
              </Link>
            </section>
            <section id="ekstensi">
              <h2>02. Pasang ekstensi Chrome.</h2>
              <p>
                Ekstensi menjadi penghubung antara halaman Google Maps dan
                workspace Hellens.
              </p>
              <ol>
                <li>
                  Unduh berkas ekstensi di bawah, lalu ekstrak ZIP ke folder
                  yang mudah ditemukan.
                </li>
                <li>
                  Buka menu Ekstensi di Chrome, pilih Kelola Ekstensi dan
                  aktifkan Mode developer.
                </li>
                <li>
                  Pilih Muat yang belum dikemas / Load unpacked, lalu pilih
                  folder yang berisi manifest.json.
                </li>
                <li>
                  Jika memperbarui versi lama, pilih folder versi baru atau klik
                  Muat ulang pada ekstensi setelah mengganti isinya.
                </li>
              </ol>
              <a className="pub-button" href="/extension.zip" download>
                <Download size={18} />
                Unduh ekstensi Hellens
              </a>
            </section>
            <section id="prospek">
              <h2>03. Temukan prospek yang relevan.</h2>
              <p>
                Buka menu Scraper di workspace. Isi kata kunci, lokasi dan
                kebutuhan data. Buat job, kemudian ikuti petunjuk untuk membuka
                Google Maps.
              </p>
              <ol>
                <li>Izinkan popup jika browser memblokir pembukaan Maps.</li>
                <li>
                  Pastikan ekstensi aktif dan koneksi internet tersedia selama
                  pengambilan data.
                </li>
                <li>
                  Tinjau nama bisnis, alamat, telepon dan website pada hasil.
                  Data yang tidak tersedia secara publik bisa kosong.
                </li>
                <li>
                  Pilih lead yang relevan, lalu simpan sebagai kontak atau
                  ekspor untuk ditinjau.
                </li>
              </ol>
              <p>
                Untuk strategi pencarian yang lebih terarah, baca{" "}
                <Link href="/blog/riset-prospek-lokal-google-maps">
                  panduan riset prospek lokal
                </Link>
                .
              </p>
            </section>
            <section id="komunikasi">
              <h2>04. Hubungkan percakapan dan tindak lanjut.</h2>
              <p>
                Jika paket aktif mendukung, hubungkan akun WhatsApp melalui QR
                di workspace. Tinjau penerima, validasi nomor dan siapkan pesan
                yang menjelaskan identitas serta konteks Anda.
              </p>
              <p>
                Email finder memeriksa website bisnis untuk mencari email
                publik. Hasil dapat kosong jika website tidak menampilkan alamat
                atau tidak dapat dibaca. Periksa kembali sebelum mengirim.
              </p>
              <p>
                Kelola balasan melalui inbox, catat tahap di CRM dan buat tugas
                untuk langkah berikutnya. Hormati permintaan berhenti
                berkomunikasi dan gunakan daftar Do-Not-Contact.
              </p>
            </section>
            <section id="kendala">
              <h2>05. Jika proses belum sesuai harapan.</h2>
              <details className="pub-faq">
                <summary>
                  Scraping berhenti atau batch belum terkirim <span>+</span>
                </summary>
                <p>
                  Periksa koneksi dan status job. Pada mode otomatis, batch yang
                  gagal tetap disimpan lokal; muat ulang halaman Maps setelah
                  koneksi kembali. Jangan menghapus ekstensi ketika masih ada
                  batch belum terkirim. Job yang sudah dihentikan atau
                  kedaluwarsa perlu diperiksa dari dashboard.
                </p>
              </details>
              <details className="pub-faq">
                <summary>
                  Pesan belum terkirim <span>+</span>
                </summary>
                <p>
                  Periksa koneksi nomor, saldo, batas harian dan alasan jeda.
                  Pengiriman massal mengikuti jendela waktu yang ditetapkan
                  sistem. Jika status tidak pasti, periksa WhatsApp/provider
                  sebelum membuat pengiriman baru.
                </p>
              </details>
              <details className="pub-faq">
                <summary>
                  Saya tidak bisa masuk <span>+</span>
                </summary>
                <p>
                  Gunakan halaman{" "}
                  <Link href="/lupa-password">lupa password</Link> untuk meminta
                  tautan reset. Jika memakai Google, pilih metode yang sama dan
                  periksa alamat akun. Jangan membagikan password, QR login atau
                  tautan reset kepada orang lain.
                </p>
              </details>
              <p>
                Masih perlu bantuan? Buka menu Bantuan di workspace atau kirim
                konteks kendala ke{" "}
                <a href="mailto:support@hellens.dev">support@hellens.dev</a>.
              </p>
            </section>
          </article>
        </div>
      </main>
    </PublicShell>
  );
}

import AdminLandingEditor from "@/components/admin/admin-landing-editor";
import OwnerCmsControl from "@/components/admin/owner-cms-control";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Database,
  FileText,
  Flag,
  Image,
  Layout,
  Megaphone,
  SlidersHorizontal,
  Sparkles,
  ToggleLeft,
  Users,
} from "lucide-react";

const modules = [
  {
    title: "Konten & Halaman",
    desc: "Halaman depan, harga, FAQ, blog, pengumuman, onboarding, empty state, dan teks produk.",
    icon: Layout,
    status: "Aktif",
  },
  {
    title: "Asset & Media",
    desc: "Logo, favicon, gambar hero, galeri screenshot, dokumen, template media, dan file unduhan.",
    icon: Image,
    status: "Dirancang",
  },
  {
    title: "Kontrol Fitur",
    desc: "Aktifkan atau matikan modul seperti scraper, CRM, validator, tagihan, white-label, dan eksperimen beta.",
    icon: ToggleLeft,
    status: "Berikutnya",
  },
  {
    title: "Paket & Monetisasi",
    desc: "Paket, harga, kuota, token/kredit, trial, add-on, voucher, dan aturan upgrade/downgrade.",
    icon: SlidersHorizontal,
    status: "Sebagian aktif",
  },
  {
    title: "Data Pelanggan",
    desc: "Data client berlangganan, industri, ukuran tim, fitur dipakai, kebutuhan, alasan berhenti, dan segmentasi.",
    icon: Users,
    status: "Berikutnya",
  },
  {
    title: "Laporan Owner",
    desc: "Pendapatan, konversi trial, aktivasi fitur, penggunaan kredit, permintaan terbanyak, retensi, dan kelompok pelanggan.",
    icon: BarChart3,
    status: "Sebagian aktif",
  },
  {
    title: "Template Sistem",
    desc: "Email, WhatsApp template, invoice, notifikasi, pesan error, tooltip, dan dokumentasi bantuan.",
    icon: FileText,
    status: "Dirancang",
  },
  {
    title: "Feedback & Rencana Fitur",
    desc: "Kumpulkan request fitur dari customer, voting internal, prioritas, dan status pengembangan.",
    icon: Flag,
    status: "Dirancang",
  },
];

const usageSignals = [
  "Industri dan kota client paling aktif",
  "Fitur yang paling sering dipakai sebelum pelanggan upgrade",
  "Bottleneck onboarding dan alasan trial tidak convert",
  "Kebutuhan pelanggan dari tiket support, feedback, dan pola penggunaan",
];

export default function AdminCmsPage() {
  return (
    <div className="space-y-6">
      <div className="cg-card-strong overflow-hidden rounded-[2rem]">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <Badge className="mb-4 gap-1 border border-primary/25 bg-primary/15 text-primary hover:bg-primary/15">
              <Sparkles className="h-3.5 w-3.5" />
              Owner CMS
            </Badge>
            <h1 className="max-w-3xl text-3xl font-black text-white sm:text-4xl">
              Pusat pengaturan Gaetin untuk konten, fitur, pelanggan, dan keputusan produk.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              CMS ini menjadi ruang internal untuk mengatur halaman, aset, media,
              kontrol fitur, paket, data client, dan laporan penggunaan tanpa perlu ubah kode.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Database className="h-4 w-4 text-primary" />
              Data yang dikumpulkan
            </div>
            <div className="mt-3 space-y-2">
              {usageSignals.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-[#080a14]/70 px-3 py-2 text-xs text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.title} className="cg-card rounded-3xl transition-all hover:-translate-y-0.5 hover:border-primary/40">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="gradient-primary flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-glow">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline">{m.status}</Badge>
                </div>
                <CardTitle className="text-base text-white">{m.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-6 text-slate-300">{m.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <OwnerCmsControl />

      <Card className="cg-card rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Megaphone className="h-5 w-5 text-primary" />
            Editor Landing Saat Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-5 max-w-2xl text-sm text-slate-300">
            Ini adalah modul CMS yang sudah aktif. Berikutnya akan dipecah menjadi form visual,
            media picker, preview, versi draft/published, dan audit perubahan.
          </p>
          <AdminLandingEditor />
        </CardContent>
      </Card>
    </div>
  );
}

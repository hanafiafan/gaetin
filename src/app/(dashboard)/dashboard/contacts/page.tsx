import Link from "next/link";
import ContactsTable from "@/components/dashboard/contacts-table";
import { Download, Sparkles, Upload, Users } from "lucide-react";

export default function ContactsPage() {
  return (
    <div className="space-y-5">
      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-sm text-slate-400">
              <Sparkles className="h-4 w-4 text-primary" />
              Contact Intelligence
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-white">Kontak & Lead</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Kelola database prospek, validasi nomor, beri label, dan siapkan segmen untuk campaign berikutnya.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/scraper" className="flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 text-sm font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary">
              <Users className="h-4 w-4" />
              Ambil lead
            </Link>
            <Link href="/dashboard/contacts/import" className="flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 text-sm font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary">
              <Upload className="h-4 w-4" />
              Impor
            </Link>
            <button className="flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 text-sm font-bold text-slate-300 transition hover:border-primary/30 hover:text-primary">
              <Download className="h-4 w-4" />
              Ekspor
            </button>
          </div>
        </div>
      </div>
      <ContactsTable />
    </div>
  );
}

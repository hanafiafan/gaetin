import Link from "next/link";
import ImportContacts from "@/components/dashboard/import-contacts";

export default function ImportPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/dashboard/contacts" className="text-sm text-primary hover:underline">
          ← Kembali ke Kontak
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-white">Impor Kontak</h1>
        <p className="text-sm text-slate-400">
          Unggah file CSV atau Excel, cocokkan kolom, lalu impor. Nomor diduplikasi otomatis disaring.
        </p>
      </div>
      <ImportContacts />
    </div>
  );
}

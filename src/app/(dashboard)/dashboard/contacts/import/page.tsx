import Link from "next/link";
import ImportContacts from "@/components/dashboard/import-contacts";

export default function ImportPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="border-b border-foreground pb-6">
        <Link href="/dashboard/contacts" className="cg-label text-muted-foreground transition hover:text-foreground">
          ← Kembali ke Kontak
        </Link>
        <h1 className="cg-display mt-4 text-4xl">Impor Kontak</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Unggah file CSV atau Excel, cocokkan kolom, lalu impor. Nomor diduplikasi otomatis disaring.
        </p>
      </div>
      <ImportContacts />
    </div>
  );
}

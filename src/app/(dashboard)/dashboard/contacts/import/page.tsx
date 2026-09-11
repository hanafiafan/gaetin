import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import PageHero from "@/components/dashboard/page-hero";
import ImportContacts from "@/components/dashboard/import-contacts";

export default function ImportPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <PageHero
        kicker="Impor Data"
        kickerIcon={Upload}
        title="Impor Kontak"
        description="Unggah file CSV atau Excel, cocokkan kolom, lalu impor. Nomor duplikat disaring otomatis."
        tone="kelola"
        rightSlot={
          <Link
            href="/dashboard/contacts"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground/80 transition hover:border-foreground/30 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Kontak
          </Link>
        }
      />
      <ImportContacts />
    </div>
  );
}

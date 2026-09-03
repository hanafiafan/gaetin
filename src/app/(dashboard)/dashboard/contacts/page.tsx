import Link from "next/link";
import ContactsTable from "@/components/dashboard/contacts-table";
import PageHero from "@/components/dashboard/page-hero";
import { Download, Mail, Sparkles, Upload, Users } from "lucide-react";

export default function ContactsPage() {
  return (
    <div className="space-y-5">
      <PageHero
        tone="primary"
        kicker="Contact Intelligence"
        kickerIcon={Sparkles}
        title="Kontak & Lead"
        description="Kelola database prospek, validasi nomor, beri label, dan siapkan segmen untuk campaign berikutnya."
        rightSlot={
          <div className="flex flex-wrap content-start gap-2">
            <Link href="/dashboard/scraper" className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-bold text-foreground/80 transition hover:border-primary/30 hover:text-foreground">
              <Users className="h-4 w-4" />
              Ambil lead
            </Link>
            <Link href="/dashboard/contacts/import" className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-bold text-foreground/80 transition hover:border-primary/30 hover:text-foreground">
              <Upload className="h-4 w-4" />
              Impor
            </Link>
            <Link href="/dashboard/email-finder" className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-bold text-foreground/80 transition hover:border-primary/30 hover:text-foreground">
              <Mail className="h-4 w-4" />
              Cari Email
            </Link>
            <button className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-bold text-foreground/80 transition hover:border-primary/30 hover:text-foreground">
              <Download className="h-4 w-4" />
              Ekspor
            </button>
          </div>
        }
      />
      <ContactsTable />
    </div>
  );
}

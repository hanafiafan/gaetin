import Link from "next/link";
import ContactsTable from "@/components/dashboard/contacts-table";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, Upload, Users } from "lucide-react";

export default function ContactsPage() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Contact Intelligence
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Kontak & Lead</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Kelola database prospek, validasi nomor, beri label, dan siapkan segmen untuk campaign berikutnya.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/scraper">
                <Users className="mr-2 h-4 w-4" />
                Ambil lead
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/contacts/import">
                <Upload className="mr-2 h-4 w-4" />
                Impor
              </Link>
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Ekspor
            </Button>
          </div>
        </div>
      </div>
      <ContactsTable />
    </div>
  );
}

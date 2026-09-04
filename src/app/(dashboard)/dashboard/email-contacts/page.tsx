import Link from "next/link";
import ContactsTable from "@/components/dashboard/contacts-table";
import PageHero from "@/components/dashboard/page-hero";
import { Tag, UserSearch } from "lucide-react";

export default function EmailContactsPage() {
  return (
    <div className="space-y-5">
      <PageHero
        tone="email"
        kicker="Email Intelligence"
        kickerIcon={Tag}
        title="Kelola Email"
        description="Lihat dan beri label semua email yang sudah ditemukan dari kontak & lead hasil scraping."
        rightSlot={
          <div className="flex flex-wrap content-start gap-2">
            <Link href="/dashboard/email-finder" className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-bold text-foreground/80 transition hover:border-email/30 hover:text-foreground">
              <UserSearch className="h-4 w-4" />
              Cari Email
            </Link>
          </div>
        }
      />
      <ContactsTable emailOnly />
    </div>
  );
}

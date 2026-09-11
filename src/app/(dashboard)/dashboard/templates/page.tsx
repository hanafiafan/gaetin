import TemplatesClient from "@/components/dashboard/templates-client";
import PageHero from "@/components/dashboard/page-hero";
import { Braces, FileText, Sparkles, Wand2 } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="space-y-5">
      <PageHero
        title="Contoh Pesan"
        description="Simpan pesan yang sering kamu pakai, supaya tidak perlu mengetik ulang tiap kali mengirim."
      />
      <TemplatesClient />
    </div>
  );
}

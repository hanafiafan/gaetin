import TeamClient from "@/components/dashboard/team-client";
import PageHero from "@/components/dashboard/page-hero";
import { ShieldCheck, Sparkles, UserPlus, Users2 } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="space-y-5">
      <PageHero
        tone="akun"
        kicker="Akun"
        title="Anggota Tim"
        description="Tambahkan rekan kerja supaya bisa ikut mengelola workspace ini. Hanya Owner dan Admin yang boleh mengubah."
      />
      <TeamClient />
    </div>
  );
}

import TeamClient from "@/components/dashboard/team-client";
import PageHero from "@/components/dashboard/page-hero";
import { ShieldCheck, Sparkles, UserPlus, Users2 } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="space-y-5">
      <PageHero
        tone="akun"
        kicker="Workspace Access"
        kickerIcon={Sparkles}
        title="Tim"
        description="Kelola anggota workspace dan perannya. Hanya Owner/Admin yang bisa menambah atau mengubah."
        features={[
          { icon: Users2, label: "Multi-user workspace" },
          { icon: ShieldCheck, label: "Role Owner/Admin/Agent" },
          { icon: UserPlus, label: "Undang anggota tim" },
        ]}
      />
      <TeamClient />
    </div>
  );
}

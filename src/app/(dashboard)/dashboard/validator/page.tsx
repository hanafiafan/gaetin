import ValidatorClient from "@/components/dashboard/validator-client";
import { Gauge, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { requirePlanFeature } from "@/lib/auth/plan-gate";

export default async function ValidatorPage() {
  await requirePlanFeature("waValidation");
  return (
    <div className="space-y-5">
      <div className="cg-card overflow-hidden rounded-2xl">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/15 px-3 py-1 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Number Hygiene</span>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Validasi Nomor</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Cek nomor aktif WhatsApp sebelum outreach untuk menghemat kredit dan menjaga delivery rate.</p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><ShieldCheck className="h-4 w-4 text-primary" /> Deteksi aktif/tidak aktif</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><Gauge className="h-4 w-4 text-primary" /> Progress real-time</div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-foreground/80"><WalletCards className="h-4 w-4 text-primary" /> Menggunakan kredit validasi</div>
          </div>
        </div>
      </div>
      <ValidatorClient />
    </div>
  );
}

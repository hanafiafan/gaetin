import ValidatorClient from "@/components/dashboard/validator-client";
import { Badge } from "@/components/ui/badge";
import { Gauge, ShieldCheck, Sparkles, WalletCards } from "lucide-react";

export default function ValidatorPage() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10"><Sparkles className="h-3.5 w-3.5" /> Number Hygiene</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Validasi Nomor</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Cek nomor aktif WhatsApp sebelum outreach untuk menghemat kredit dan menjaga delivery rate.</p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><ShieldCheck className="h-4 w-4 text-primary" /> Deteksi aktif/tidak aktif</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Gauge className="h-4 w-4 text-primary" /> Progress real-time</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><WalletCards className="h-4 w-4 text-primary" /> Menggunakan kredit validasi</div>
          </div>
        </div>
      </div>
      <ValidatorClient />
    </div>
  );
}

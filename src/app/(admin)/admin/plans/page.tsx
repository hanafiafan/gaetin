import AdminPlansEditor from "@/components/admin/admin-plans-editor";
import { Badge } from "@/components/ui/badge";
import { Coins, Sparkles, Tags } from "lucide-react";

export default function AdminPlansPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10"><Sparkles className="h-3.5 w-3.5" /> Monetization CMS</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Paket & Harga</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Atur harga, jatah kredit, diskon tahunan, dan paket top-up. Berlaku langsung di landing &
          halaman langganan.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Tags className="h-4 w-4 text-primary" /> Plan catalog</span>
          <span className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Coins className="h-4 w-4 text-primary" /> Credit packs</span>
        </div>
      </div>
      <AdminPlansEditor />
    </div>
  );
}

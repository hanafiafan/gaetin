import MapClient from "@/components/dashboard/map-client";
import { Badge } from "@/components/ui/badge";
import { Filter, Map, MapPinned, Sparkles } from "lucide-react";

export default function MapPage() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary hover:bg-primary/10"><Sparkles className="h-3.5 w-3.5" /> Market Map</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Analisis Pasar</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Sebaran geografis kontak/lead. Warna marker mengikuti stage CRM dan dapat difilter per kota, kategori, atau stage.</p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Map className="h-4 w-4 text-primary" /> Peta kontak berkoordinat</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><Filter className="h-4 w-4 text-primary" /> Filter kota, kategori, stage</div>
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"><MapPinned className="h-4 w-4 text-primary" /> Visualisasi area prospek</div>
          </div>
        </div>
      </div>
      <MapClient />
    </div>
  );
}

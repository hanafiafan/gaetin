"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  Building2,
  CheckCircle2,
  Columns3,
  Compass,
  Download,
  ExternalLink,
  Filter,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Navigation,
  Palette,
  Radar,
  Save,
  Search,
  Smartphone,
  Star,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const DEFAULT_CENTER = { lat: -6.2088, lng: 106.8456 }; // Jakarta
const DEFAULT_FIELDS: DataField[] = ["phone", "address", "website", "category", "coordinates"];

type DataField = "phone" | "address" | "website" | "email" | "category" | "rating" | "coordinates";

const DATA_FIELDS: Array<{ value: DataField; label: string; description: string; icon: LucideIcon }> = [
  { value: "phone", label: "Nomor WhatsApp", description: "Telepon dan nomor kontak bisnis.", icon: Smartphone },
  { value: "address", label: "Alamat", description: "Alamat area atau lokasi bisnis.", icon: Building2 },
  { value: "website", label: "Website", description: "Link website resmi bila tersedia.", icon: Globe2 },
  { value: "email", label: "Email", description: "Email publik dari sumber data.", icon: Mail },
  { value: "category", label: "Kategori", description: "Jenis usaha untuk segmentasi.", icon: Search },
  { value: "rating", label: "Rating", description: "Rating dan jumlah ulasan jika ada.", icon: Star },
  { value: "coordinates", label: "Koordinat", description: "Latitude dan longitude lead.", icon: MapPin },
];

interface Lead {
  id: string;
  businessName: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  saved: boolean;
}
interface Job {
  id: string;
  name: string | null;
  color: string | null;
  keyword: string;
  status: string;
  totalFound: number;
  createdAt: string;
}

export default function ScraperClient({ legacyOsmEnabled = false }: { legacyOsmEnabled?: boolean }) {
  const mapEl = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const circleRef = useRef<any>(null);
  const geoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [radius, setRadius] = useState(5);
  const [label, setLabel] = useState("");
  const [mode, setMode] = useState<"auto" | "manual" | "extension">(legacyOsmEnabled ? "auto" : "extension");
  const [regionInput, setRegionInput] = useState("");
  const [regionSuggestions, setRegionSuggestions] = useState<{display_name: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapSearch, setMapSearch] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [areaName, setAreaName] = useState("");
  const [maxLeads, setMaxLeads] = useState("100");
  const [color, setColor] = useState("#2563eb");
  const [dataFields, setDataFields] = useState<Set<DataField>>(new Set(DEFAULT_FIELDS));
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [leadQuery, setLeadQuery] = useState("");
  const [savedFilter, setSavedFilter] = useState<"all" | "saved" | "unsaved">("all");
  const [phoneOnly, setPhoneOnly] = useState(false);
  const [minRating, setMinRating] = useState("0");
  const [busy, setBusy] = useState(false);
  const selectedJobId = currentJob?.id ?? activeJobId;

  function geocode(lat: number, lng: number) {
    if (geoTimer.current) clearTimeout(geoTimer.current);
    geoTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const j = await r.json();
        setLabel(j.display_name ?? "");
      } catch {
        // abaikan
      }
    }, 600);
  }

  async function loadSaved() {
    const r = await fetch("/api/scraper");
    const j = await r.json();
    if (j.success) setSavedJobs(j.data);
  }

  useEffect(() => {
    loadSaved();
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapEl.current || mapRef.current) return;
      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      const map = L.map(mapEl.current).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
      const marker = L.marker([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], { draggable: true, icon }).addTo(map);
      const circle = L.circle([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], { radius: radius * 1000, color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.12 }).addTo(map);
      mapRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
      const setPoint = (lat: number, lng: number) => {
        setCenter({ lat, lng });
        marker.setLatLng([lat, lng]);
        circle.setLatLng([lat, lng]);
        geocode(lat, lng);
      };
      marker.on("dragend", () => {
        const ll = marker.getLatLng();
        setPoint(ll.lat, ll.lng);
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on("click", (e: any) => setPoint(e.latlng.lat, e.latlng.lng));
      geocode(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
    })();
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (circleRef.current) circleRef.current.setRadius(radius * 1000);
  }, [activeJobId, currentJob]);

  useEffect(() => {
    if (mode === "auto" && regionInput.trim().length > 2 && showSuggestions) {
      const delayFn = setTimeout(async () => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(regionInput)}&limit=5`);
          const j = await r.json();
          setRegionSuggestions(j || []);
        } catch {}
      }, 500);
      return () => clearTimeout(delayFn);
    } else if (regionInput.trim().length <= 2) {
      setRegionSuggestions([]);
    }
  }, [regionInput, mode, showSuggestions]);

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setStyle({ color, fillColor: color });
    }
  }, [color]);

  async function loadLeads(jobId: string) {
    const params = new URLSearchParams({ scraperJobId: jobId, pageSize: "200" });
    if (leadQuery.trim()) params.set("query", leadQuery.trim());
    if (savedFilter === "saved") params.set("saved", "true");
    if (savedFilter === "unsaved") params.set("saved", "false");
    if (phoneOnly) params.set("hasPhone", "true");
    if (Number(minRating) > 0) params.set("minRating", minRating);
    const r = await fetch(`/api/leads?${params.toString()}`);
    const j = await r.json();
    if (j.success) setLeads(j.data.items);
  }

  useEffect(() => {
    if (selectedJobId) loadLeads(selectedJobId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadQuery, savedFilter, phoneOnly, minRating, selectedJobId]);

  function poll(id: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const r = await fetch(`/api/scraper/${id}`);
      const j = await r.json();
      if (j.success) {
        setJobStatus(j.data.status);
        
        // Selalu muat leads agar terlihat real-time bertambah
        loadLeads(id);
        
        if (["COMPLETED", "FAILED", "STOPPED"].includes(j.data.status)) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setBusy(false);
          loadSaved();
        }
      }
    }, 2000);
  }

  async function handleMapSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!mapSearch.trim()) return;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearch)}`);
      const j = await r.json();
      if (j && j.length > 0) {
        const lat = parseFloat(j[0].lat);
        const lon = parseFloat(j[0].lon);
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lon], 13);
        }
        setCenter({ lat, lng: lon });
        markerRef.current?.setLatLng([lat, lon]);
        circleRef.current?.setLatLng([lat, lon]);
        setLabel(j[0].display_name);
      }
    } catch {}
  }

  function locateMe() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          if (mapRef.current) {
            mapRef.current.flyTo([lat, lon], 14);
          }
          setCenter({ lat, lng: lon });
          markerRef.current?.setLatLng([lat, lon]);
          circleRef.current?.setLatLng([lat, lon]);
          geocode(lat, lon);
        },
        () => alert("Gagal mendapatkan lokasi. Pastikan izin lokasi aktif."),
      );
    } else {
      alert("Browser Anda tidak mendukung geolokasi.");
    }
  }

  async function start() {
    if (keywords.length === 0) return;
    const combinedKeyword = keywords.join(", ");
    setBusy(true);
    setLeads([]);
    setSelected(new Set());
    const r = await fetch("/api/scraper/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        mode === "auto" 
          ? {
              keyword: combinedKeyword,
              mode: "text",
              location: regionInput,
              name: areaName || `${combinedKeyword} (${regionInput})`,
              color,
              dataFields: [...dataFields],
            }
          : {
              keyword: combinedKeyword,
              mode: "map",
              centerLat: center.lat,
              centerLng: center.lng,
              radiusKm: radius,
              locationLabel: label,
              name: areaName || `${combinedKeyword} (${radius}km)`,
              color,
              dataFields: [...dataFields],
            }
      ),
    });
    const j = await r.json();
    if (!r.ok) {
      setBusy(false);
      alert(j?.error?.message ?? "Gagal memulai");
      return;
    }
    let jobName = areaName;
    if (!jobName) {
      if (mode === "extension") jobName = `${combinedKeyword} (${regionInput || "Indonesia"})`;
      else if (mode === "auto") jobName = `${combinedKeyword} (${regionInput})`;
      else jobName = `${combinedKeyword} (${radius}km)`;
    }
    setCurrentJob({ id: j.data.id, name: jobName, color, keyword: combinedKeyword, status: "RUNNING", totalFound: 0, createdAt: new Date().toISOString() });
    setActiveJobId(j.data.id);
    setJobStatus("RUNNING");
    
    if (mode === "extension") {
      const location = regionInput || "Indonesia";
      const q = encodeURIComponent(`${combinedKeyword} di ${location}`);
      const gmapsUrl = `https://www.google.com/maps/search/${q}?gaetin_job_id=${j.data.id}&gaetin_auto=true&gaetin_max=${maxLeads}`;
      window.open(gmapsUrl, "_blank");
    } else {
      // Trigger background execution and let it hang so Vercel doesn't kill it
      fetch(`/api/scraper/${j.data.id}/execute`, { method: "POST" }).catch(e => console.error("Execute failed", e));
    }
    
    poll(j.data.id);
  }

  async function openSaved(job: Job) {
    setCurrentJob(job);
    setActiveJobId(job.id);
    setJobStatus(job.status);
    setSelected(new Set());
    loadLeads(job.id);
  }

  function toggle(id: string) {
    setSelected((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function deleteJob(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("Hapus area ini dan semua kontak yang belum disimpan?")) return;
    setBusy(true);
    const r = await fetch(`/api/scraper/${id}`, { method: "DELETE" });
    setBusy(false);
    if (r.ok) {
      if (currentJob?.id === id) {
        setCurrentJob(null);
        setActiveJobId(null);
        setLeads([]);
      }
      loadSaved();
    } else {
      const j = await r.json();
      alert(j?.error?.message ?? "Gagal menghapus");
    }
  }
  function toggleDataField(field: DataField) {
    setDataFields((prev) => {
      const next = new Set(prev);
      if (next.has(field) && next.size > 1) next.delete(field);
      else next.add(field);
      return next;
    });
  }
  function toggleAll() {
    setSelected((p) => (p.size === leads.length ? new Set() : new Set(leads.map((l) => l.id))));
  }
  function exportHref(format = "csv") {
    const params = new URLSearchParams({ pageSize: "5000" });
    if (selectedJobId) params.set("scraperJobId", selectedJobId);
    if (leadQuery.trim()) params.set("query", leadQuery.trim());
    if (savedFilter === "saved") params.set("saved", "true");
    if (savedFilter === "unsaved") params.set("saved", "false");
    if (phoneOnly) params.set("hasPhone", "true");
    if (Number(minRating) > 0) params.set("minRating", minRating);
    params.set("format", format);
    return `/api/leads/export?${params.toString()}`;
  }

  async function saveSelected(addToPipeline = false) {
    if (selected.size === 0) return;
    const r = await fetch("/api/leads/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], addToPipeline }),
    });
    const j = await r.json();
    if (!r.ok) {
      alert(j?.error?.message ?? "Gagal");
      return;
    }
    alert(`Tersimpan ${j.data.saved} kontak, masuk pipeline ${j.data.pipelineAdded ?? 0}, dilewati ${j.data.skipped}.`);
    setSelected(new Set());
    if (selectedJobId) loadLeads(selectedJobId);
  }

  function mapsLink(l: Lead) {
    if (l.latitude != null && l.longitude != null)
return `https://www.google.com/maps/search/?api=1&query=${l.latitude},${l.longitude}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.businessName + " " + (l.address ?? ""))}`;
  }

  return (
    <div className="space-y-5">
      <div className={cn("grid gap-4 items-start", legacyOsmEnabled ? "xl:grid-cols-[minmax(0,1fr)_380px]" : "max-w-xl mx-auto")}>
        {legacyOsmEnabled && (
          mode === "manual" ? (
            <Card className="overflow-hidden rounded-2xl shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b bg-card px-4 py-3 gap-3">
                  <div>
                    <div className="font-semibold text-sm">Area pencarian manual</div>
                    <div className="text-xs text-muted-foreground">Klik peta atau cari lokasi</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <form onSubmit={handleMapSearch} className="flex items-center">
                       <Input value={mapSearch} onChange={e=>setMapSearch(e.target.value)} placeholder="Cari daerah..." className="h-8 text-sm max-w-[140px]" />
                       <Button type="submit" size="sm" className="ml-1 h-8 px-2" variant="outline">Cari</Button>
                    </form>
                    <Button type="button" onClick={locateMe} size="sm" variant="outline" className="h-8 w-8 p-0 shrink-0" title="Lokasi Saya">
                      <Compass className="h-4 w-4" />
                    </Button>
                    <Badge variant="outline" className="ml-2">{radius} km</Badge>
                  </div>
                </div>
                <div ref={mapEl} className="h-[440px] w-full" />
              </CardContent>
            </Card>
          ) : mode === "auto" ? (
            <Card className="rounded-2xl shadow-sm flex items-center justify-center bg-muted/10 h-full min-h-[440px]">
              <CardContent className="text-center p-6 max-w-md">
                <Radar className="h-12 w-12 mx-auto text-primary/40 mb-4" />
                <h3 className="text-lg font-semibold">Otomatis Wilayah</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Pencarian tidak menggunakan titik pin atau radius, melainkan mencari di seluruh batas wilayah (kota/kabupaten) yang Anda ketik di kolom samping.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl shadow-sm flex items-center justify-center bg-muted/10 h-full min-h-[440px]">
              <CardContent className="text-center p-6 max-w-md">
                <h3 className="text-lg font-semibold">Mode Ekstensi</h3>
                <p className="text-sm text-muted-foreground mt-2">Pencarian dilakukan otomatis di tab Google Maps yang dibuka oleh sistem.</p>
              </CardContent>
            </Card>
          )
        )}
        
        {mode === "extension" && activeJobId ? (
            <Card className="border-primary/50 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
              <CardContent className="p-6 text-center space-y-4">
                <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin" />
                <div>
                  <h3 className="font-semibold text-lg text-primary">Scraping Otomatis Berjalan</h3>
                  <p className="text-sm text-muted-foreground mt-2">Tab Google Maps telah dibuka. Ekstensi Gaetin sedang menyedot data secara otomatis. Harap jangan tutup tab tersebut hingga selesai.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div>
              <div className="text-base font-semibold">Kontrol scraping</div>
              <p className="mt-1 text-sm text-muted-foreground">Atur metode pencarian dan detail data.</p>
            </div>

            {legacyOsmEnabled ? (
              <div className="flex rounded-lg border bg-muted/30 p-1">
                  <button
                    type="button"
                    onClick={() => setMode("auto")}
                    className={cn("px-4 py-2 flex-1 text-sm rounded-full transition-colors font-medium border-2 border-transparent", mode === "auto" ? "bg-popover text-popover-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  >
                    Otomatis Wilayah
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className={cn("px-4 py-2 flex-1 text-sm rounded-full transition-colors font-medium border-2 border-transparent", mode === "manual" ? "bg-popover text-popover-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  >
                    Custom Area
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("extension")}
                    className={cn("px-4 py-2 flex-1 text-sm rounded-full transition-colors font-medium border-2 border-transparent", mode === "extension" ? "bg-popover text-popover-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  >
                    Ekstensi Chrome
                  </button>
              </div>
            ) : (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                <div className="font-semibold text-primary">Mode Ekstensi Aktif</div>
                <div className="text-xs text-muted-foreground mt-1">Metode pencarian Peta/Radius dinonaktifkan oleh Admin.</div>
              </div>
            )}

            {mode !== "extension" && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Mode gratis aktif
                </div>
                <p className="text-xs leading-relaxed text-emerald-50/80">
                  Menggunakan peta OpenStreetMap, reverse geocode Nominatim, dan sumber lead Overpass/OpenStreetMap tanpa API key.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Kata kunci bisnis</label>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw, i) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20">
                      {kw}
                      <button 
                        type="button" 
                        onClick={() => setKeywords((p) => p.filter((_, idx) => idx !== i))}
                        className="ml-2 text-primary hover:text-primary/70 focus:outline-none"
                      >
                        &times;
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      value={keywordInput} 
                      onChange={(e) => setKeywordInput(e.target.value)} 
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          const val = keywordInput.trim();
                          if (val && !keywords.includes(val)) {
                            setKeywords([...keywords, val]);
                            setKeywordInput("");
                          }
                        }
                      }}
                      placeholder="Ketik lalu tekan Enter (mis. kedai kopi)" 
                      className="pl-9" 
                    />
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const val = keywordInput.trim();
                      if (val && !keywords.includes(val)) {
                        setKeywords([...keywords, val]);
                        setKeywordInput("");
                      }
                    }}
                  >
                    Tambah
                  </Button>
                </div>
              </div>
            </div>

              {mode === "extension" ? (
                <div className="space-y-4 pt-2">
                  <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
                    <h4 className="font-semibold text-primary mb-2 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Scraping Otomatis (BETA)</h4>
                    <p className="text-sm text-muted-foreground mb-4">Gaetin akan mengekstrak data langsung dari Google Maps tanpa API key.</p>
                    <ol className="list-decimal pl-4 text-sm text-muted-foreground space-y-2 mb-4">
                      <li>Masukkan Target Wilayah dan Batas Jumlah Data.</li>
                      <li>Klik <strong>Mulai Scraping</strong> di bawah.</li>
                      <li>Sistem akan otomatis membuka tab Google Maps, menyedot data, lalu menutup tab tersebut.</li>
                    </ol>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Wilayah / Kota</label>
                      <Input placeholder="Contoh: Jakarta Selatan" value={regionInput} onChange={(e) => setRegionInput(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Batas Jumlah Lead</label>
                      <Input type="number" min="1" max="1000" placeholder="Maksimal 1000" value={maxLeads} onChange={(e) => setMaxLeads(e.target.value)} />
                    </div>
                  </div>
                </div>
              ) : mode === "auto" ? (
              <div className="space-y-2 border-l-2 border-primary pl-3 py-1 relative">
                <label className="text-sm font-medium text-primary">Nama Wilayah / Kota</label>
                <Input 
                  value={regionInput} 
                  onChange={(e) => {
                    setRegionInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="mis. Bandung, Jakarta Selatan" 
                />
                <p className="text-xs text-muted-foreground">Sistem akan mencari lead di seluruh area administrasi ini.</p>
                {showSuggestions && regionSuggestions.length > 0 && (
                  <div className="absolute top-[calc(100%+0.25rem)] left-0 right-0 z-50 max-h-60 overflow-y-auto rounded-lg border border-border bg-background/95 backdrop-blur-md shadow-xl outline-none ring-1 ring-black/5">
                    {regionSuggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        className="w-full text-left relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2.5 text-sm outline-none hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        onClick={() => {
                          setRegionInput(s.display_name);
                          setShowSuggestions(false);
                        }}
                      >
                        {s.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama area (Opsional)</label>
                <Input value={areaName} onChange={(e) => setAreaName(e.target.value)} placeholder="mis. Gym Bekasi Timur" />
              </div>
            )}

            {mode === "manual" && (
              <div className="grid gap-3 sm:grid-cols-[1fr_72px]">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Radius pencarian: {radius} km</label>
                  <input type="range" min={1} max={20} step={1} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full accent-primary" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-sm font-medium">
                    <Palette className="h-4 w-4" />
                    Warna
                  </label>
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full rounded-md border" aria-label="Warna area" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium">Data yang diambil</label>
                <span className="text-xs text-muted-foreground">{dataFields.size} aktif</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {DATA_FIELDS.map((field) => {
                  const Icon = field.icon;
                  const active = dataFields.has(field.value);
                  return (
                    <button
                      key={field.value}
                      type="button"
                      onClick={() => toggleDataField(field.value)}
                      className={cn(
                        "flex min-h-[76px] items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                        active ? "border-primary bg-primary/10 text-foreground" : "bg-muted/20 text-muted-foreground hover:bg-muted/40",
                      )}
                      aria-pressed={active}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          active ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{field.label}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{field.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {mode === "manual" && (
              <div className="rounded-xl border bg-muted/30 p-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                  <Navigation className="h-3.5 w-3.5" />
                  Lokasi pusat
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {label || "Klik peta atau geser pin untuk titik pusat."}
                </p>
              </div>
            )}

            <Button className="h-11 w-full rounded-full" onClick={start} disabled={busy || keywords.length === 0 || (mode === "auto" && !regionInput.trim())}>
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping {jobStatus ? `(${jobStatus})` : ""}
                </>
              ) : (
                <>
                  <Radar className="mr-2 h-4 w-4" />
                  Mulai scraping
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        )}
      </div>

      {savedJobs.length > 0 && (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Area tersimpan</h2>
                <p className="text-xs text-muted-foreground">Buka ulang job lama untuk melihat hasil dan menyimpan kontak.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
            {savedJobs.map((j) => (
              <div
                key={j.id}
                className={cn(
                  "flex items-center gap-1 rounded-full border bg-background pr-1 pl-3 py-1 text-sm transition-colors hover:bg-muted",
                  currentJob?.id === j.id && "border-primary bg-primary/5",
                )}
              >
                <button
                  type="button"
                  onClick={() => openSaved(j)}
                  className="flex items-center gap-2"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: j.color ?? "#888" }} />
                  <span className={cn(currentJob?.id === j.id && "font-semibold text-primary")}>
                    {j.name ?? j.keyword}
                  </span>
                  <span className="text-xs text-muted-foreground">({j.totalFound})</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => deleteJob(e, j.id)}
                  className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Hapus area"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedJobId && (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Hasil lead</h2>
                <p className="text-sm text-muted-foreground">
                  {currentJob?.name ? `${currentJob.name} · ` : ""}{leads.length} hasil ditemukan
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a href={exportHref("csv")}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </a>
                </Button>
                <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" asChild>
                  <a href={exportHref("xlsx")}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                  </a>
                </Button>
                <Button size="sm" variant="outline" disabled={selected.size === 0} onClick={() => saveSelected(false)}>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan {selected.size > 0 ? `(${selected.size})` : ""}
                </Button>
                <Button size="sm" disabled={selected.size === 0} onClick={() => saveSelected(true)}>
                  <Columns3 className="mr-2 h-4 w-4" />
                  Simpan + pipeline
                </Button>
              </div>
            </div>
            <div className="grid gap-2 rounded-xl border bg-muted/20 p-3 md:grid-cols-[minmax(0,1fr)_150px_120px_140px]">
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={leadQuery} onChange={(e) => setLeadQuery(e.target.value)} placeholder="Cari bisnis, kategori, atau nomor" className="pl-9" />
              </div>
              <select
                value={savedFilter}
                onChange={(e) => setSavedFilter(e.target.value as "all" | "saved" | "unsaved")}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-label="Filter status simpan"
              >
                <option value="all">Semua status</option>
                <option value="unsaved">Belum disimpan</option>
                <option value="saved">Sudah disimpan</option>
              </select>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-label="Filter rating"
              >
                <option value="0">Semua rating</option>
                <option value="3">Rating 3+</option>
                <option value="4">Rating 4+</option>
                <option value="4.5">Rating 4.5+</option>
              </select>
              <label className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm">
                <input type="checkbox" checked={phoneOnly} onChange={(e) => setPhoneOnly(e.target.checked)} />
                Ada nomor
              </label>
            </div>
            <div className="overflow-hidden rounded-xl border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-sm">
                  <thead className="bg-muted/40">
                    <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="w-10 p-3">
                    <input type="checkbox" checked={leads.length > 0 && selected.size === leads.length} onChange={toggleAll} aria-label="Pilih semua" />
                  </th>
                  <th className="p-3">Bisnis</th>
                  <th className="p-3">No. WA</th>
                  <th className="hidden p-3 md:table-cell">Rating</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-card">
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                      Belum ada hasil untuk filter ini.
                    </td>
                  </tr>
                )}
                {leads.map((l) => (
                  <tr key={l.id} className="border-b last:border-0 align-top hover:bg-muted/30">
                    <td className="p-3">
                      <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} disabled={l.saved} aria-label={`Pilih ${l.businessName}`} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 font-semibold">
                        {l.businessName}
                        {l.saved && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      </div>
                      <div className="text-xs text-muted-foreground">{l.address ?? "-"}</div>
                      {l.category && <Badge variant="outline" className="mt-2">{l.category}</Badge>}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {l.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Smartphone className="h-4 w-4" />
                          +{l.phone}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="hidden p-3 md:table-cell">
                      {l.rating ?? "-"}{l.reviewCount ? ` (${l.reviewCount})` : ""}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        {l.phone && (
                          <a href={`https://wa.me/${l.phone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-500/20">Chat</a>
                        )}
                        {l.website && (
                          <a href={l.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted">
                            <Globe2 className="h-3.5 w-3.5" />
                            Web
                          </a>
                        )}
                        <a href={mapsLink(l)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Maps
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
          </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  Building2,
  CheckCircle2,
  Clock,
  Columns3,
  Compass,
  Download,
  ExternalLink,
  Filter,
  Globe2,
  Image,
  Loader2,
  Link2,
  Mail,
  MapPin,
  MessageSquare,
  Navigation,
  Palette,
  QrCode,
  Radar,
  Save,
  Search,
  Settings2,
  Smartphone,
  Star,
  Tag,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_CENTER = { lat: -6.2088, lng: 106.8456 }; // Jakarta
const DEFAULT_FIELDS: DataField[] = ["phone", "address", "website", "category", "coordinates"];

type DataField =
  | "phone"
  | "address"
  | "website"
  | "email"
  | "category"
  | "rating"
  | "coordinates"
  | "openingHours"
  | "priceRange"
  | "amenities"
  | "serviceOptions"
  | "plusCode"
  | "mapsUrl"
  | "reviews"
  | "photos"
  | "description";

const DATA_FIELDS: Array<{ value: DataField; label: string; description: string; icon: LucideIcon }> = [
  { value: "phone", label: "Nomor WhatsApp", description: "Telepon dan nomor kontak bisnis.", icon: Smartphone },
  { value: "address", label: "Alamat", description: "Alamat area atau lokasi bisnis.", icon: Building2 },
  { value: "website", label: "Website", description: "Link website resmi bila tersedia.", icon: Globe2 },
  { value: "email", label: "Email", description: "Email publik dari sumber data.", icon: Mail },
  { value: "category", label: "Kategori", description: "Jenis usaha untuk segmentasi.", icon: Tag },
  { value: "rating", label: "Rating", description: "Rating dan jumlah ulasan jika ada.", icon: Star },
  { value: "coordinates", label: "Koordinat", description: "Latitude dan longitude lead.", icon: MapPin },
  { value: "openingHours", label: "Jam Buka", description: "Jam operasional setiap hari.", icon: Clock },
  { value: "priceRange", label: "Rentang Harga", description: "Kisaran harga (Rp, $$, dll).", icon: Search },
  { value: "amenities", label: "Fasilitas", description: "Fasilitas tersedia (Wi-Fi, parkir, dll).", icon: Settings2 },
  { value: "serviceOptions", label: "Opsi Layanan", description: "Makan di tempat, delivery, takeaway, dll.", icon: Settings2 },
  { value: "plusCode", label: "Plus Code", description: "Kode lokasi Google Plus Code.", icon: QrCode },
  { value: "mapsUrl", label: "URL Maps", description: "Link langsung Google Maps tempat ini.", icon: Link2 },
  { value: "reviews", label: "Ulasan", description: "5 ulasan teratas dari Google Maps.", icon: MessageSquare },
  { value: "photos", label: "Foto", description: "URL foto bisnis dari Google Maps.", icon: Image },
  { value: "description", label: "Deskripsi", description: "Deskripsi singkat dari profil bisnis.", icon: Search },
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
  const esRef = useRef<EventSource | null>(null);

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
      if (esRef.current) { esRef.current.close(); esRef.current = null; }
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

  function subscribe(id: string) {
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
    const es = new EventSource(`/api/scraper/${id}/events`);
    esRef.current = es;
    es.onmessage = (e) => {
      const data = JSON.parse(e.data) as { status: string; totalFound: number };
      setJobStatus(data.status);
      loadLeads(id);
      if (["COMPLETED", "FAILED", "STOPPED"].includes(data.status)) {
        es.close();
        esRef.current = null;
        setBusy(false);
        loadSaved();
      }
    };
    es.onerror = () => {
      // EventSource auto-reconnects on transient errors; we close only on terminal job states
    };
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
        mode === "extension"
          ? {
              keyword: combinedKeyword,
              mode: "extension",
              name: areaName || `${combinedKeyword}${regionInput ? ` (${regionInput})` : ""}`,
              color,
              dataFields: [...dataFields],
            }
          : mode === "auto"
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
      const gmapsUrl = `https://www.google.com/maps/search/${q}` +
        `?gaetin_job_id=${j.data.id}` +
        `&gaetin_token=${j.data.extensionToken ?? ""}` +
        `&gaetin_auto=true` +
        `&gaetin_max=${maxLeads}` +
        `&gaetin_delay=2` +
        `&gaetin_fields=${[...dataFields].join(",")}`;
      window.open(gmapsUrl, "_blank");
    } else {
      // Trigger background execution and let it hang so Vercel doesn't kill it
      fetch(`/api/scraper/${j.data.id}/execute`, { method: "POST" }).catch(e => console.error("Execute failed", e));
    }

    subscribe(j.data.id);
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
    if (currentJob?.name) params.set("jobName", currentJob.name);
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
      <div className={cn("grid gap-4 items-start", legacyOsmEnabled ? "xl:grid-cols-[minmax(0,1fr)_380px]" : "max-w-2xl mx-auto")}>
        {legacyOsmEnabled && (
          mode === "manual" ? (
            <div className="cg-card overflow-hidden rounded-2xl">
              <div className="p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border bg-card px-4 py-3 gap-3">
                  <div>
                    <div className="font-semibold text-sm">Area pencarian manual</div>
                    <div className="text-xs text-muted-foreground">Klik peta atau cari lokasi</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <form onSubmit={handleMapSearch} className="flex items-center">
                       <input value={mapSearch} onChange={e=>setMapSearch(e.target.value)} placeholder="Cari daerah..." className="h-8 max-w-[140px] rounded-xl border border-border bg-card px-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none" />
                       <button type="submit" className="ml-1 flex h-8 items-center rounded-lg border border-border px-2 text-xs font-bold text-foreground/80 transition hover:border-primary/30 hover:text-primary">Cari</button>
                    </form>
                    <button type="button" onClick={locateMe} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-foreground/80 transition hover:border-primary/30 hover:text-primary" title="Lokasi Saya">
                      <Compass className="h-4 w-4" />
                    </button>
                    <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">{radius} km</span>
                  </div>
                </div>
                <div ref={mapEl} className="h-[440px] w-full" />
              </div>
            </div>
          ) : mode === "auto" ? (
            <div className="cg-card flex min-h-[440px] h-full items-center justify-center rounded-2xl">
              <div className="p-6 max-w-md text-center">
                <Radar className="h-12 w-12 mx-auto text-primary/40 mb-4" />
                <h3 className="text-lg font-bold text-foreground">Otomatis Wilayah</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Pencarian tidak menggunakan titik pin atau radius, melainkan mencari di seluruh batas wilayah (kota/kabupaten) yang Anda ketik di kolom samping.
                </p>
              </div>
            </div>
          ) : (
            <div className="cg-card flex min-h-[440px] h-full items-center justify-center rounded-2xl">
              <div className="p-6 max-w-md text-center">
                <h3 className="text-lg font-bold text-foreground">Mode Ekstensi</h3>
                <p className="text-sm text-muted-foreground mt-2">Pencarian dilakukan otomatis di tab Google Maps yang dibuka oleh sistem.</p>
              </div>
            </div>
          )
        )}
        
        {mode === "extension" && activeJobId && jobStatus === "RUNNING" ? (
            <div className="cg-card rounded-2xl border-primary/30 bg-primary/[0.03]">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">Scraping berjalan</div>
                    <p className="text-xs text-muted-foreground mt-0.5">Tab Google Maps terbuka. Jangan tutup sampai selesai — data masuk otomatis.</p>
                    {currentJob && (
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{currentJob.name ?? currentJob.keyword}</span>
                        <span className="text-primary font-semibold">{currentJob.totalFound} lead</span>
                      </div>
                    )}
                    <button
                      className="mt-3 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                      onClick={async () => {
                        if (!activeJobId) return;
                        await fetch(`/api/scraper/${activeJobId}/stop`, { method: "POST" });
                        setBusy(false);
                        setJobStatus("STOPPED");
                      }}
                    >
                      Sudah selesai? Tandai selesai
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="cg-card rounded-2xl">
          <div className="space-y-5 p-5">

            {legacyOsmEnabled && (
              <div className="flex rounded-xl border border-border bg-muted/50 p-1">
                  <button
                    type="button"
                    onClick={() => setMode("auto")}
                    className={cn("flex-1 rounded-full border-2 border-transparent px-4 py-2 text-sm font-medium transition-colors", mode === "auto" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  >
                    Otomatis Wilayah
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className={cn("flex-1 rounded-full border-2 border-transparent px-4 py-2 text-sm font-medium transition-colors", mode === "manual" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  >
                    Custom Area
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("extension")}
                    className={cn("flex-1 rounded-full border-2 border-transparent px-4 py-2 text-sm font-medium transition-colors", mode === "extension" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  >
                    Ekstensi Chrome
                  </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Kata kunci bisnis <span className="font-normal text-muted-foreground">(bisa lebih dari satu)</span></label>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {kw}
                      <button
                        type="button"
                        onClick={() => setKeywords((p) => p.filter((_, idx) => idx !== i))}
                        className="ml-1 opacity-70 hover:opacity-100 focus:outline-none"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
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
                      className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const val = keywordInput.trim();
                      if (val && !keywords.includes(val)) {
                        setKeywords([...keywords, val]);
                        setKeywordInput("");
                      }
                    }}
                    className="flex h-10 items-center rounded-xl border border-border px-4 text-sm font-bold text-foreground/80 transition hover:border-primary/30 hover:text-primary"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>

              {mode === "extension" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl border border-border bg-muted/50 px-3 py-3">
                      <Search className="mx-auto mb-2 h-4 w-4 text-primary" />
                      <div className="text-xs font-semibold text-foreground">Kata kunci</div>
                      <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">Jenis bisnis yang dicari</div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/50 px-3 py-3">
                      <MapPin className="mx-auto mb-2 h-4 w-4 text-primary" />
                      <div className="text-xs font-semibold text-foreground">Target wilayah</div>
                      <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">Kota atau kecamatan</div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/50 px-3 py-3">
                      <Radar className="mx-auto mb-2 h-4 w-4 text-primary" />
                      <div className="text-xs font-semibold text-foreground">Mulai</div>
                      <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">Maps terbuka otomatis</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Wilayah / Kota</label>
                      <input placeholder="cth: Jakarta Selatan" value={regionInput} onChange={(e) => setRegionInput(e.target.value)} className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Maks. jumlah lead</label>
                      <input type="number" min="1" max="1000" placeholder="100" value={maxLeads} onChange={(e) => setMaxLeads(e.target.value)} className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none" />
                    </div>
                  </div>
                </div>
              ) : mode === "auto" ? (
              <div className="relative space-y-2 border-l-2 border-primary py-1 pl-3">
                <label className="text-sm font-medium text-primary">Nama Wilayah / Kota</label>
                <input
                  value={regionInput}
                  onChange={(e) => {
                    setRegionInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="mis. Bandung, Jakarta Selatan"
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
                />
                <p className="text-xs text-muted-foreground">Sistem akan mencari lead di seluruh area administrasi ini.</p>
                {showSuggestions && regionSuggestions.length > 0 && (
                  <div className="absolute top-[calc(100%+0.25rem)] left-0 right-0 z-50 max-h-60 overflow-y-auto rounded-xl border border-border bg-[#0d1126]/95 shadow-xl backdrop-blur-md">
                    {regionSuggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2.5 text-left text-sm text-foreground/80 outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
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
                <label className="text-sm font-medium text-foreground">Nama area (Opsional)</label>
                <input value={areaName} onChange={(e) => setAreaName(e.target.value)} placeholder="mis. Gym Bekasi Timur" className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none" />
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
                <span className="text-xs text-muted-foreground">{dataFields.size} / {DATA_FIELDS.length} aktif</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {DATA_FIELDS.map((field) => {
                  const Icon = field.icon;
                  const active = dataFields.has(field.value);
                  return (
                    <button
                      key={field.value}
                      type="button"
                      onClick={() => toggleDataField(field.value)}
                      title={field.description}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        active
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-muted/50 text-muted-foreground hover:border-border hover:text-foreground",
                      )}
                      aria-pressed={active}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {field.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {mode === "manual" && (
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                  <Navigation className="h-3.5 w-3.5" />
                  Lokasi pusat
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {label || "Klik peta atau geser pin untuk titik pusat."}
                </p>
              </div>
            )}

            <button
              className="flex h-11 w-full items-center justify-center rounded-full bg-primary font-semibold text-black transition hover:bg-primary/90 disabled:opacity-50"
              onClick={start}
              disabled={busy || keywords.length === 0 || (mode === "auto" && !regionInput.trim()) || (mode === "extension" && !regionInput.trim())}
            >
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {jobStatus === "RUNNING" ? "Sedang scraping..." : "Mempersiapkan..."}
                </>
              ) : (
                <>
                  <Radar className="mr-2 h-4 w-4" />
                  {mode === "extension" ? "Mulai & Buka Google Maps" : "Mulai Scraping"}
                </>
              )}
            </button>
          </div>
        </div>
        )}
      </div>

      {savedJobs.length > 0 && (
        <div className="cg-card rounded-2xl">
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Riwayat scraping</h2>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">{savedJobs.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
            {savedJobs.map((j) => (
              <div
                key={j.id}
                className={cn(
                  "flex items-center gap-1 rounded-full border border-border bg-muted/50 pr-1 pl-3 py-1 text-sm transition hover:border-border",
                  currentJob?.id === j.id && "border-primary/30 bg-primary/[0.06]",
                )}
              >
                <button
                  type="button"
                  onClick={() => openSaved(j)}
                  className="flex items-center gap-2"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: j.color ?? "#888" }} />
                  <span className={cn("max-w-[140px] truncate", currentJob?.id === j.id && "font-semibold text-primary")}>
                    {j.name ?? j.keyword}
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">{j.totalFound}</span>
                  {j.status === "RUNNING" && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />}
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
          </div>
        </div>
      )}

      {selectedJobId && (
        <div className="cg-card rounded-2xl">
          <div className="space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-foreground">Hasil lead</h2>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold tabular-nums text-primary">
                  {leads.length}
                </span>
                {currentJob?.name && (
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">{currentJob.name}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={exportHref("csv")} className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-bold text-foreground/80 transition hover:border-primary/30 hover:text-primary">
                  <Download className="h-4 w-4" />
                  Export CSV
                </a>
                <a href={exportHref("xlsx")} className="flex h-8 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20">
                  <Download className="h-4 w-4" />
                  Export Excel
                </a>
                <button disabled={selected.size === 0} onClick={() => saveSelected(false)} className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-bold text-foreground/80 transition hover:border-primary/30 hover:text-primary disabled:opacity-40">
                  <Save className="h-4 w-4" />
                  Simpan {selected.size > 0 ? `(${selected.size})` : ""}
                </button>
                <button disabled={selected.size === 0} onClick={() => saveSelected(true)} className="flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-3 text-xs font-bold text-primary transition hover:bg-primary/25 disabled:opacity-40">
                  <Columns3 className="h-4 w-4" />
                  Simpan + pipeline
                </button>
              </div>
            </div>
            <div className="grid gap-2 rounded-xl border border-border bg-card p-3 md:grid-cols-[minmax(0,1fr)_150px_120px_140px]">
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={leadQuery} onChange={(e) => setLeadQuery(e.target.value)} placeholder="Cari bisnis, kategori, atau nomor" className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none" />
              </div>
              <select
                value={savedFilter}
                onChange={(e) => setSavedFilter(e.target.value as "all" | "saved" | "unsaved")}
                className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground"
                aria-label="Filter status simpan"
              >
                <option value="all">Semua status</option>
                <option value="unsaved">Belum disimpan</option>
                <option value="saved">Sudah disimpan</option>
              </select>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground"
                aria-label="Filter rating"
              >
                <option value="0">Semua rating</option>
                <option value="3">Rating 3+</option>
                <option value="4">Rating 4+</option>
                <option value="4.5">Rating 4.5+</option>
              </select>
              <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-foreground/80">
                <input type="checkbox" checked={phoneOnly} onChange={(e) => setPhoneOnly(e.target.checked)} className="accent-primary" />
                Ada nomor
              </label>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase">
                  <th className="w-10 p-3">
                    <input type="checkbox" checked={leads.length > 0 && selected.size === leads.length} onChange={toggleAll} aria-label="Pilih semua" className="accent-primary" />
                  </th>
                  <th className="p-3 font-bold text-muted-foreground">Bisnis</th>
                  <th className="p-3 font-bold text-muted-foreground">No. WA</th>
                  <th className="hidden p-3 md:table-cell font-bold text-muted-foreground">Rating</th>
                  <th className="p-3 text-right font-bold text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                      Belum ada hasil untuk filter ini.
                    </td>
                  </tr>
                )}
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-border/50 last:border-0 align-top hover:bg-card">
                    <td className="p-3">
                      <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} disabled={l.saved} aria-label={`Pilih ${l.businessName}`} className="accent-primary" />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        {l.businessName}
                        {l.saved && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                      </div>
                      <div className="text-xs text-muted-foreground">{l.address ?? "-"}</div>
                      {l.category && <span className="mt-2 inline-block rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">{l.category}</span>}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {l.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Smartphone className="h-4 w-4" />
                          +{l.phone}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="hidden p-3 md:table-cell text-muted-foreground">
                      {l.rating ?? "-"}{l.reviewCount ? ` (${l.reviewCount})` : ""}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        {l.phone && (
                          <a href={`https://wa.me/${l.phone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20">Chat</a>
                        )}
                        {l.website && (
                          <a href={l.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-foreground/80 hover:border-white/20">
                            <Globe2 className="h-3.5 w-3.5" />
                            Web
                          </a>
                        )}
                        <a href={mapsLink(l)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-foreground/80 hover:border-white/20">
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
          </div>
        </div>
      )}
    </div>
  );
}

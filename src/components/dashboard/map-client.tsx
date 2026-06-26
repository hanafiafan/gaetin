"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

interface Point {
  id: string;
  name: string | null;
  phone: string;
  latitude: number;
  longitude: number;
  city: string | null;
  category: string | null;
  crmStage: string | null;
}

function stageColor(stage: string | null): string {
  switch (stage) {
    case "Lead Baru": return "#3b82f6";
    case "Dihubungi": return "#f59e0b";
    case "Negosiasi": return "#8b5cf6";
    case "Closed Won": return "#22c55e";
    case "Closed Lost": return "#ef4444";
    default: return "#6b7280";
  }
}

export default function MapClient() {
  const mapEl = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);

  const [points, setPoints] = useState<Point[]>([]);
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [stage, setStage] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      LRef.current = L;
      if (cancelled || !mapEl.current || mapRef.current) return;
      const map = L.map(mapEl.current).setView([-2.5, 118], 5); // Indonesia
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    })();
    const r = fetch("/api/analytics/map").then((x) => x.json());
    r.then((j) => {
      if (!cancelled && j.success) setPoints(j.data.points);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Gambar ulang marker saat data/filter berubah.
  useEffect(() => {
    const L = LRef.current;
    const layer = layerRef.current;
    const map = mapRef.current;
    if (!ready || !L || !layer || !map) return;
    layer.clearLayers();

    const filtered = points.filter(
      (p) =>
        (!city || p.city === city) &&
        (!category || p.category === category) &&
        (!stage || p.crmStage === stage),
    );

    const latlngs: [number, number][] = [];
    for (const p of filtered) {
      const color = stageColor(p.crmStage);
      L.circleMarker([p.latitude, p.longitude], {
        radius: 6,
        color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: 1,
      })
        .bindPopup(
          `<strong>${p.name ?? "+" + p.phone}</strong><br/>+${p.phone}<br/>${p.category ?? ""} ${p.city ? "· " + p.city : ""}`,
        )
        .addTo(layer);
      latlngs.push([p.latitude, p.longitude]);
    }
    if (latlngs.length > 0) {
      try {
        map.fitBounds(latlngs, { padding: [30, 30], maxZoom: 13 });
      } catch {
        // abaikan
      }
    }
  }, [points, city, category, stage, ready]);

  const cities = [...new Set(points.map((p) => p.city).filter(Boolean))] as string[];
  const categories = [...new Set(points.map((p) => p.category).filter(Boolean))] as string[];
  const stages = [...new Set(points.map((p) => p.crmStage).filter(Boolean))] as string[];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select value={city} onChange={(e) => setCity(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
          <option value="">Semua kota</option>
          {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
          <option value="">Semua kategori</option>
          {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
        <select value={stage} onChange={(e) => setStage(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
          <option value="">Semua stage</option>
          {stages.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
        <span className="ml-auto text-sm text-muted-foreground">{points.length} titik berkoordinat</span>
      </div>
      <div ref={mapEl} className="h-[480px] w-full rounded-md border" />
    </div>
  );
}

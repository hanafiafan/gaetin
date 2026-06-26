"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface LeadHistory {
  id: string;
  businessName: string;
  category: string | null;
  latitude: number;
  longitude: number;
  scraperJob: {
    color: string | null;
    name: string | null;
    keyword: string;
  } | null;
}

export function MapHistoryClient({ leads }: { leads: LeadHistory[] }) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapEl.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled) return;

      if (!mapRef.current) {
        mapRef.current = L.map(mapEl.current!).setView([-2.5489, 118.0149], 5); // Center Indonesia
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; OpenStreetMap contributors & CARTO',
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;
      
      // Clear existing layers if any
      map.eachLayer((layer: any) => {
        if (layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

      const bounds = L.latLngBounds([]);

      leads.forEach((lead) => {
        if (lead.latitude && lead.longitude) {
          const color = lead.scraperJob?.color || "#2563eb";
          const marker = L.circleMarker([lead.latitude, lead.longitude], {
            radius: 6,
            fillColor: color,
            color: "#ffffff",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(map);

          marker.bindTooltip(
            `<b>${lead.businessName}</b><br/>
            ${lead.category ? `<span style="color:#666">${lead.category}</span><br/>` : ""}
            <span style="font-size:11px;color:#888">Dari Job: ${lead.scraperJob?.name || lead.scraperJob?.keyword || "Manual"}</span>`,
            { direction: "top", offset: [0, -5] }
          );

          bounds.extend([lead.latitude, lead.longitude]);
        }
      });

      if (leads.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [leads]);

  return <div ref={mapEl} className="h-full w-full z-0" />;
}

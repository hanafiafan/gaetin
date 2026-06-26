// Utilitas geospasial untuk scraper berbasis titik pusat + radius.

const EARTH_RADIUS_KM = 6371;
const KM_PER_DEG_LAT = 110.574;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Jarak haversine antara dua koordinat (km). */
export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Perkiraan zoom Google Maps untuk radius tertentu (bias pencarian). */
export function zoomForRadius(radiusKm: number): number {
  if (radiusKm <= 2) return 15;
  if (radiusKm <= 5) return 14;
  if (radiusKm <= 10) return 13;
  if (radiusKm <= 15) return 12;
  return 11;
}

export interface GridPoint {
  lat: number;
  lng: number;
}

/**
 * Hasilkan titik-titik grid di dalam radius. Radius kecil = satu titik; radius
 * besar = beberapa titik untuk cakupan. Dibatasi maksimal 60 titik.
 */
export function generateGrid(centerLat: number, centerLng: number, radiusKm: number): GridPoint[] {
  if (radiusKm <= 3) return [{ lat: centerLat, lng: centerLng }];

  const stepKm = 2.5; // jarak antar titik
  const kmPerDegLng = 111.32 * Math.cos(toRad(centerLat)) || KM_PER_DEG_LAT;
  const steps = Math.ceil(radiusKm / stepKm);

  const points: GridPoint[] = [];
  for (let i = -steps; i <= steps; i++) {
    for (let j = -steps; j <= steps; j++) {
      const dyKm = i * stepKm;
      const dxKm = j * stepKm;
      const lat = centerLat + dyKm / KM_PER_DEG_LAT;
      const lng = centerLng + dxKm / kmPerDegLng;
      if (haversineKm(centerLat, centerLng, lat, lng) <= radiusKm) {
        points.push({ lat, lng });
      }
    }
  }
  if (points.length === 0) points.push({ lat: centerLat, lng: centerLng });
  return points.slice(0, 60);
}

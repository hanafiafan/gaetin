import { env } from "@/lib/env";

// Engine sumber data lokasi/lead yang dapat ditukar per workspace:
// - OSM_SCRAPER : default gratis via Overpass/OpenStreetMap, atau microservice bila SCRAPER_SERVICE_URL diisi.
// - GOOGLE_PLACES: Google Places API "Text Search (New)" (resmi/legal, berbayar, BYOK key).

export type ScraperProvider = "OSM_SCRAPER" | "GOOGLE_PLACES";

export interface RawPlace {
  businessName: string;
  phone?: string;
  address?: string;
  website?: string;
  email?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  latitude?: number;
  longitude?: number;
}

export interface GetPlacesOpts {
  provider: ScraperProvider;
  apiKey?: string | null;
  keyword: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  region?: string;
  zoom?: number;
  location?: string;
  limit: number;
}

// ---------- OSM / Overpass / optional external scraper ----------

function escapeOverpassRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\"]/g, "\\$&");
}

function keywordRegex(keyword: string): string {
  const raw = keyword
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length >= 2);
  const synonyms = new Set(raw);

  for (const term of raw) {
    if (["gym", "fitness", "fitnes"].includes(term)) {
      ["gym", "fitness", "fitness centre", "fitness_centre", "sports centre", "sports_centre"].forEach((v) => synonyms.add(v));
    }
    if (["cafe", "caffe", "kafe", "coffee", "kopi", "coffee shop"].includes(term)) {
      ["cafe", "coffee", "kopi", "coffee shop"].forEach((v) => synonyms.add(v));
    }
    if (["klinik", "clinic", "dokter", "doctor"].includes(term)) {
      ["clinic", "doctors", "healthcare", "hospital"].forEach((v) => synonyms.add(v));
    }
    if (["resto", "restaurant", "restoran", "makan", "rumah makan", "warung makan"].includes(term)) {
      ["restaurant", "food", "fast_food"].forEach((v) => synonyms.add(v));
    }
  }

  const pattern = [...synonyms].map(escapeOverpassRegex).join("|");
  return pattern || escapeOverpassRegex(keyword.trim());
}

function overpassSelectors(radiusMeters: number, lat: number, lng: number, regex: string): string {
  const around = `(around:${radiusMeters},${lat},${lng})`;
  const tags = ["name", "amenity", "shop", "healthcare", "office"];
  return tags
    .flatMap((tag) => [
      `node${around}["${tag}"~"${regex}",i];`,
      `way${around}["${tag}"~"${regex}",i];`,
      `relation${around}["${tag}"~"${regex}",i];`,
    ])
    .join("\n");
}

function tagValue(tags: Record<string, string>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = tags[key];
    if (value) return value;
  }
  return undefined;
}

function formatAddress(tags: Record<string, string>): string | undefined {
  const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
  const area = [
    tags["addr:suburb"] ?? tags["addr:village"] ?? tags["addr:neighbourhood"],
    tags["addr:city"] ?? tags["addr:town"] ?? tags["addr:county"],
    tags["addr:state"],
    tags["addr:postcode"],
  ].filter(Boolean);
  const parts = [street, ...area].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
}

function categoryFromTags(tags: Record<string, string>): string | undefined {
  return tagValue(tags, ["amenity", "shop", "leisure", "tourism", "healthcare", "office", "craft", "sport"]);
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
}

function normalizeOsm(p: Record<string, unknown>): RawPlace {
  return {
    businessName: String(p.businessName ?? p.title ?? p.name ?? "Tanpa nama"),
    phone: (p.phone as string) ?? undefined,
    address: (p.address as string) ?? undefined,
    website: (p.website as string) ?? undefined,
    email: (p.email as string) ?? undefined,
    rating: typeof p.rating === "number" ? p.rating : undefined,
    reviewCount:
      typeof p.reviewCount === "number" ? p.reviewCount : (p.reviews as number) ?? undefined,
    category: (p.category as string) ?? undefined,
    latitude: typeof p.latitude === "number" ? p.latitude : (p.lat as number) ?? undefined,
    longitude: typeof p.longitude === "number" ? p.longitude : (p.lng as number) ?? undefined,
  };
}

async function osmScrape(o: GetPlacesOpts): Promise<RawPlace[]> {
  if (!env.SCRAPER_SERVICE_URL) return overpassSearch(o);

  const body =
    o.lat != null && o.lng != null
      ? { keyword: o.keyword, lat: o.lat, lng: o.lng, zoom: o.zoom, limit: o.limit }
      : { keyword: o.keyword, location: o.location, limit: o.limit };
  const res = await fetch(`${env.SCRAPER_SERVICE_URL.replace(/\/$/, "")}/scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("SCRAPER_REQUEST_FAILED");
  const data = (await res.json()) as { places?: unknown[] } | unknown[];
  const list = Array.isArray(data) ? data : (data.places ?? []);
  return (list as Record<string, unknown>[]).map(normalizeOsm);
}

async function overpassSearch(o: GetPlacesOpts): Promise<RawPlace[]> {
  if (!o.region && (o.lat == null || o.lng == null || o.radiusKm == null)) return [];

  const regex = keywordRegex(o.keyword);
  let query = "";

  if (o.region) {
    // OSM "name" tag rarely contains the full comma-separated address, usually just the city name.
    const shortRegion = o.region.split(",")[0].trim();
    const areaName = escapeOverpassRegex(shortRegion);
    const tags = ["name", "amenity", "shop", "healthcare", "office"];
    const statements = tags.flatMap(tag => [
      `node(area.searchArea)["${tag}"~"${regex}",i];`,
      `way(area.searchArea)["${tag}"~"${regex}",i];`,
      `relation(area.searchArea)["${tag}"~"${regex}",i];`
    ]).join("\n");
    
    query = `
[out:json][timeout:60];
area["name"~"${areaName}",i]->.searchArea;
(
${statements}
);
out center ${Math.min(Math.max(o.limit, 1), 300)};
`;
  } else {
    const radiusMeters = Math.min(Math.max(Math.round(o.radiusKm! * 1000), 250), 20_000);
    query = `
[out:json][timeout:60];
(
${overpassSelectors(radiusMeters, o.lat!, o.lng!, regex)}
);
out center ${Math.min(Math.max(o.limit, 1), 120)};
`;
  }

  const res = await fetch(env.OVERPASS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data: query }),
  });
  if (!res.ok) throw new Error("OVERPASS_REQUEST_FAILED");

  const data = (await res.json()) as { elements?: OverpassElement[] };
  return (data.elements ?? []).slice(0, o.limit).map((el) => {
    const tags = el.tags ?? {};
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;

    return {
      businessName: tagValue(tags, ["name", "brand", "operator"]) ?? "Tanpa nama",
      phone: tagValue(tags, ["phone", "contact:phone", "mobile", "contact:mobile"]),
      address: formatAddress(tags),
      website: tagValue(tags, ["website", "contact:website", "url"]),
      email: tagValue(tags, ["email", "contact:email"]),
      rating: undefined,
      reviewCount: undefined,
      category: categoryFromTags(tags),
      latitude: lat,
      longitude: lng,
    };
  });
}

// ---------- Google Places (Text Search New) ----------

interface GPlace {
  displayName?: { text?: string };
  nationalPhoneNumber?: string;
  formattedAddress?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  types?: string[];
  location?: { latitude?: number; longitude?: number };
}

async function googleTextSearch(o: GetPlacesOpts): Promise<RawPlace[]> {
  if (!o.apiKey) throw new Error("GOOGLE_KEY_MISSING");
  const fieldMask = [
    "places.displayName",
    "places.nationalPhoneNumber",
    "places.formattedAddress",
    "places.websiteUri",
    "places.rating",
    "places.userRatingCount",
    "places.types",
    "places.location",
  ].join(",");

  const body: Record<string, unknown> = { textQuery: o.keyword, pageSize: 20 };
  if (o.lat != null && o.lng != null && o.radiusKm != null) {
    body.locationBias = {
      circle: { center: { latitude: o.lat, longitude: o.lng }, radius: o.radiusKm * 1000 },
    };
  } else if (o.location) {
    body.textQuery = `${o.keyword} ${o.location}`;
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": o.apiKey,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("GOOGLE_REQUEST_FAILED");
  const data = (await res.json()) as { places?: GPlace[] };
  return (data.places ?? []).map((p) => ({
    businessName: p.displayName?.text ?? "Tanpa nama",
    phone: p.nationalPhoneNumber,
    address: p.formattedAddress,
    website: p.websiteUri,
    email: undefined, // Google tidak menyediakan email
    rating: p.rating,
    reviewCount: p.userRatingCount,
    category: p.types?.[0],
    latitude: p.location?.latitude,
    longitude: p.location?.longitude,
  }));
}

export function getPlaces(o: GetPlacesOpts): Promise<RawPlace[]> {
  return o.provider === "GOOGLE_PLACES" ? googleTextSearch(o) : osmScrape(o);
}

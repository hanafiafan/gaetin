import { prisma } from "@/lib/db/prisma";
import { generateGrid, zoomForRadius, haversineKm } from "@/lib/geo";
import { getPlaces, type RawPlace, type ScraperProvider } from "@/lib/scraper/engine";
import { normalizePhone } from "@/lib/utils";
import { getWorkspacePlan } from "@/lib/plans/limits";

const DEFAULT_DATA_FIELDS = ["phone", "address", "website", "email", "category", "rating", "coordinates"] as const;

async function isStopped(jobId: string): Promise<boolean> {
  const j = await prisma.scraperJob.findUnique({ where: { id: jobId }, select: { status: true } });
  return j?.status === "STOPPED";
}

function requestedFields(value: unknown): Set<string> {
  if (!Array.isArray(value)) return new Set(DEFAULT_DATA_FIELDS);
  const fields = value.filter((item): item is string => typeof item === "string");
  return fields.length ? new Set(fields) : new Set(DEFAULT_DATA_FIELDS);
}

/**
 * Menjalankan satu job scraping. Sumber data (OSM scraper / Google Places)
 * ditentukan per workspace. Dipanggil di latar belakang dari route start.
 */
export async function runScraperJob(jobId: string): Promise<void> {
  const job = await prisma.scraperJob.findUnique({ where: { id: jobId } });
  if (!job) return;

  const ws = await prisma.workspace.findUnique({
    where: { id: job.workspaceId },
    select: { scraperProvider: true, googleMapsApiKey: true },
  });
  const provider: ScraperProvider =
    ws?.scraperProvider === "GOOGLE_PLACES" ? "GOOGLE_PLACES" : "OSM_SCRAPER";
  const apiKey = ws?.googleMapsApiKey ?? null;
  const plan = await getWorkspacePlan(job.workspaceId);
  const maxResults = plan.limits.scraperMaxResultsPerJob;
  const perPointLimit = Math.min(provider === "GOOGLE_PLACES" ? 20 : 120, maxResults);
  const fields = requestedFields(job.dataFields);

  const hasCenter = job.centerLat != null && job.centerLng != null && job.radiusKm != null;
  const hasRegion = !hasCenter && job.location != null;
  // Google menangani radius dalam satu panggilan; OSM scraper memakai grid.
  const points: ({ lat: number; lng: number } | null)[] = hasRegion 
    ? [null]
    : (!hasCenter
      ? [null]
      : provider === "GOOGLE_PLACES"
        ? [{ lat: job.centerLat as number, lng: job.centerLng as number }]
        : generateGrid(job.centerLat as number, job.centerLng as number, job.radiusKm as number));
  const zoom = job.radiusKm ? zoomForRadius(job.radiusKm) : 13;

  const seen = new Set<string>();
  let totalFound = 0;
  let duplicates = 0;
  let firstPoint = true;

  try {
    for (const p of points) {
      if (await isStopped(jobId)) break;
      if (totalFound >= maxResults) break;

      let places: RawPlace[] = [];
      let retryCount = 0;
      
      while (retryCount < 3) {
        try {
          places = await getPlaces({
            provider,
            apiKey,
            keyword: job.keyword,
            lat: p?.lat,
            lng: p?.lng,
            radiusKm: job.radiusKm ?? undefined,
            region: hasRegion ? (job.location ?? undefined) : undefined,
            zoom,
            location: job.location ?? undefined,
            limit: perPointLimit,
          });
          break; // Success
        } catch {
          retryCount++;
          if (retryCount >= 3) {
            if (firstPoint && !hasRegion) {
              await prisma.scraperJob.update({ where: { id: jobId }, data: { status: "FAILED" } });
              return;
            }
          } else {
            await new Promise((r) => setTimeout(r, 2000));
          }
        }
      }
      
      if (retryCount >= 3 && (!firstPoint || hasRegion)) continue;
      firstPoint = false;

      for (const pl of places) {
        if (totalFound >= maxResults) break;
        const phone = pl.phone ? normalizePhone(pl.phone) : "";
        const key = phone || `${pl.businessName}|${pl.address ?? ""}`.toLowerCase();
        if (seen.has(key)) {
          duplicates += 1;
          continue;
        }
        seen.add(key);

        if (hasCenter && pl.latitude != null && pl.longitude != null) {
          const d = haversineKm(job.centerLat as number, job.centerLng as number, pl.latitude, pl.longitude);
          if (d > (job.radiusKm as number)) continue;
        }

        await prisma.lead.create({
          data: {
            workspaceId: job.workspaceId,
            scraperJobId: job.id,
            businessName: pl.businessName,
            phone: fields.has("phone") ? phone || null : null,
            email: fields.has("email") ? pl.email ?? null : null,
            website: fields.has("website") ? pl.website ?? null : null,
            address: fields.has("address") ? pl.address ?? null : null,
            category: fields.has("category") ? pl.category ?? null : null,
            rating: fields.has("rating") ? pl.rating ?? null : null,
            reviewCount: fields.has("rating") ? pl.reviewCount ?? null : null,
            latitude: fields.has("coordinates") ? pl.latitude ?? null : null,
            longitude: fields.has("coordinates") ? pl.longitude ?? null : null,
          },
        });
        totalFound += 1;
      }

      await prisma.scraperJob.update({ where: { id: jobId }, data: { totalFound, duplicates } });
    }

    const stopped = await isStopped(jobId);
    await prisma.scraperJob.update({
      where: { id: jobId },
      data: { status: stopped ? "STOPPED" : "COMPLETED", totalFound, duplicates },
    });
  } catch {
    await prisma.scraperJob
      .update({ where: { id: jobId }, data: { status: "FAILED" } })
      .catch(() => undefined);
  }
}

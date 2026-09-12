-- Mode peta (titik pusat + radius) dan pemilihan provider scraper sudah dihapus
-- dari kode: alurnya hanya lewat ekstensi Chrome. Kolom-kolom ini tidak lagi
-- ditulis maupun dibaca siapa pun.
ALTER TABLE "ScraperJob"
  DROP COLUMN "centerLat",
  DROP COLUMN "centerLng",
  DROP COLUMN "radiusKm",
  DROP COLUMN "gridPoints";

ALTER TABLE "Workspace"
  DROP COLUMN "scraperProvider",
  DROP COLUMN "googleMapsApiKey";

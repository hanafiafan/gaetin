-- Alasan sebuah kampanye/blast berhenti sendiri (mis. rem otomatis saat
-- pengiriman banyak gagal). Tanpa ini, berhentinya terbaca sebagai kerusakan.
ALTER TABLE "Blast" ADD COLUMN "pauseReason" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "pauseReason" TEXT;

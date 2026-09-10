-- Satu kontak hanya boleh punya satu baris pesan per campaign/blast.
-- Tanpa constraint ini, menambahkan ulang penerima atau menjalankan pengiriman
-- dua kali (double-click, retry) mengirim pesan ganda ke orang yang sama dan
-- memotong kredit dua kali.

-- Bersihkan duplikat lama lebih dulu, kalau tidak CREATE UNIQUE INDEX di bawah
-- akan menggagalkan deploy. Baris tertua dipertahankan sebagai pengiriman asli.
DELETE FROM "BlastMessage" a
  USING "BlastMessage" b
  WHERE a."blastId" = b."blastId"
    AND a."contactId" = b."contactId"
    AND (a."createdAt", a."id") > (b."createdAt", b."id");

DELETE FROM "CampaignMessage" a
  USING "CampaignMessage" b
  WHERE a."campaignId" = b."campaignId"
    AND a."contactId" = b."contactId"
    AND (a."createdAt", a."id") > (b."createdAt", b."id");

-- CreateIndex
CREATE UNIQUE INDEX "BlastMessage_blastId_contactId_key" ON "BlastMessage"("blastId", "contactId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMessage_campaignId_contactId_key" ON "CampaignMessage"("campaignId", "contactId");

-- Menyelaraskan default warna dengan schema (drift tersisa dari era `db push`).
-- AlterTable
ALTER TABLE "BrandingSettings" ALTER COLUMN "primaryColor" SET DEFAULT '#E4FF00',
ALTER COLUMN "secondaryColor" SET DEFAULT '#0A0A0A';

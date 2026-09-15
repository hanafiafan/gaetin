-- Kirim blas sampai habis: batas harian per paket dan per nomor, serta jam
-- kirim 08.00-20.00, diabaikan selama ini menyala.
ALTER TABLE "Workspace" ADD COLUMN "blastFull" BOOLEAN NOT NULL DEFAULT false;

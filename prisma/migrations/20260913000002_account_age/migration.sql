-- Umur nomor menurut pemiliknya. Menentukan dari anak tangga pemanasan mana
-- sebuah nomor mulai: yang baru dibeli mulai dari 20 pesan/hari, yang sudah
-- dipakai bertahun-tahun langsung memakai batas penuhnya.
ALTER TABLE "MessagingAccount" ADD COLUMN "accountAge" TEXT NOT NULL DEFAULT 'BARU';

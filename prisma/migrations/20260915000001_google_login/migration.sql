-- Login dengan Google. passwordHash boleh kosong karena akun yang dibuat lewat
-- Google belum pernah memilih password; googleId menautkan akun secara stabil
-- walau email penggunanya nanti berubah.
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN "googleId" TEXT;
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

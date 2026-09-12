-- Catatan manual per kontak: hasil telepon, keberatan, janji. Sebelumnya tidak
-- ada tempat menyimpannya, jadi apa pun yang terjadi di luar aplikasi hilang.
CREATE TABLE "ContactNote" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContactNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContactNote_contactId_createdAt_idx" ON "ContactNote"("contactId", "createdAt");

ALTER TABLE "ContactNote" ADD CONSTRAINT "ContactNote_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactNote" ADD CONSTRAINT "ContactNote_contactId_fkey"
  FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

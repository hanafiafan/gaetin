-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "lastInboundAt" TIMESTAMP(3),
ADD COLUMN     "lastOutboundAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "FollowUpSchedule" ADD COLUMN     "outboundAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "allocationCredits" INTEGER;

-- CreateTable
CREATE TABLE "BackgroundJob" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "generation" INTEGER NOT NULL DEFAULT 1,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackgroundJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboundDelivery" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "accountId" TEXT,
    "contactId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "cost" INTEGER NOT NULL,
    "waMessageId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutboundDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidationRun" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "active" INTEGER NOT NULL DEFAULT 0,
    "inactive" INTEGER NOT NULL DEFAULT 0,
    "unverified" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'running',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ValidationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "id" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BackgroundJob_status_runAt_idx" ON "BackgroundJob"("status", "runAt");

-- CreateIndex
CREATE INDEX "OutboundDelivery_workspaceId_channel_createdAt_idx" ON "OutboundDelivery"("workspaceId", "channel", "createdAt");

-- CreateIndex
CREATE INDEX "OutboundDelivery_accountId_createdAt_idx" ON "OutboundDelivery"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "RateLimitBucket_resetAt_idx" ON "RateLimitBucket"("resetAt");

-- CreateIndex
-- Preserve duplicate historical messages; only the first retains the provider ID.
WITH ranked AS (
 SELECT id, row_number() OVER (PARTITION BY "conversationId", "waMessageId" ORDER BY "createdAt", id) AS n
 FROM "InboxMessage" WHERE "waMessageId" IS NOT NULL
) UPDATE "InboxMessage" SET "waMessageId" = NULL WHERE id IN (SELECT id FROM ranked WHERE n > 1);

CREATE UNIQUE INDEX "InboxMessage_conversationId_waMessageId_key" ON "InboxMessage"("conversationId", "waMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "FollowUpSchedule_ruleId_contactId_outboundAt_key" ON "FollowUpSchedule"("ruleId", "contactId", "outboundAt");


-- Reconstruct only evidenced message directions; lastContacted was ambiguous.
UPDATE "Contact" c SET "lastInboundAt" = x.at FROM (
 SELECT v."contactId", max(m."createdAt") AS at FROM "InboxMessage" m JOIN "Conversation" v ON v.id=m."conversationId"
 WHERE m.direction='INBOUND' GROUP BY v."contactId"
) x WHERE c.id=x."contactId";
UPDATE "Contact" c SET "lastOutboundAt" = x.at FROM (
 SELECT "contactId", max(at) AS at FROM (
  SELECT "contactId", "sentAt" AS at FROM "CampaignMessage" WHERE status IN ('SENT','DELIVERED','READ')
  UNION ALL SELECT "contactId", "sentAt" FROM "BlastMessage" WHERE status IN ('SENT','DELIVERED','READ')
  UNION ALL SELECT v."contactId", m."createdAt" FROM "InboxMessage" m JOIN "Conversation" v ON v.id=m."conversationId" WHERE m.direction='OUTBOUND' AND NOT m."isInternalNote" AND m.status IN ('SENT','DELIVERED','READ')
 ) outbound GROUP BY "contactId"
) x WHERE c.id=x."contactId";

-- Preserve today's usage and sent receipts, without charging historical messages again.
INSERT INTO "OutboundDelivery" (id,"workspaceId","accountId","contactId",channel,status,cost,"createdAt","updatedAt")
 SELECT 'CAMPAIGN:'||m.id,c."workspaceId",c."accountId",m."contactId",'WHATSAPP','SENT',0,COALESCE(m."sentAt",m."createdAt"),CURRENT_TIMESTAMP
 FROM "CampaignMessage" m JOIN "Campaign" c ON c.id=m."campaignId" WHERE m.status IN ('SENT','DELIVERED','READ')
 UNION ALL
 SELECT 'BLAST:'||m.id,b."workspaceId",b.variables->>'accountId',m."contactId",'WHATSAPP','SENT',0,COALESCE(m."sentAt",m."createdAt"),CURRENT_TIMESTAMP
 FROM "BlastMessage" m JOIN "Blast" b ON b.id=m."blastId" WHERE m.status IN ('SENT','DELIVERED','READ')
 UNION ALL
 SELECT 'FOLLOW_UP:'||s.id,r."workspaceId",r."triggerValue"->>'accountId',s."contactId",'WHATSAPP','SENT',0,COALESCE(s."sentAt",s."createdAt"),CURRENT_TIMESTAMP
 FROM "FollowUpSchedule" s JOIN "FollowUpRule" r ON r.id=s."ruleId" WHERE s.status='SENT';

-- Recover persisted pending work on first worker start. Unknown legacy in-flight sends
-- have no receipts: stop old processes before applying this migration.
INSERT INTO "BackgroundJob" (id,kind,"workspaceId",payload,"updatedAt")
 SELECT 'CAMPAIGN:'||id,'CAMPAIGN',"workspaceId",jsonb_build_object('id',id),CURRENT_TIMESTAMP FROM "Campaign" WHERE status='ACTIVE'
 UNION ALL SELECT 'BLAST:'||id,'BLAST',"workspaceId",jsonb_build_object('id',id),CURRENT_TIMESTAMP FROM "Blast" WHERE status='RUNNING'
 UNION ALL SELECT 'EMAIL_BLAST:'||id,'EMAIL_BLAST',"workspaceId",jsonb_build_object('id',id),CURRENT_TIMESTAMP FROM "EmailBlast" WHERE status='RUNNING';

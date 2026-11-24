-- AlterTable
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "whatsappPhoneNumberId" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "whatsappBusinessAccountId" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "whatsappAccessToken" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Organization_whatsappPhoneNumberId_idx" ON "Organization"("whatsappPhoneNumberId");
CREATE INDEX IF NOT EXISTS "Organization_facebookPageId_idx" ON "Organization"("facebookPageId");

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "optedOutOfMarketing" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "optedOutAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'DELIVERED';
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "providerMessageId" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "errorMessage" TEXT;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Message_providerMessageId_idx" ON "Message"("providerMessageId");

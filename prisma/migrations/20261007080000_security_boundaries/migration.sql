-- Additive security migration; apply after baselining the existing schema.
ALTER TABLE "User" ADD COLUMN "platformRole" TEXT NOT NULL DEFAULT 'USER';
ALTER TABLE "Organization" ADD COLUMN "whatsappPhoneNumberId" TEXT;
CREATE UNIQUE INDEX "Organization_whatsappPhoneNumberId_key" ON "Organization"("whatsappPhoneNumberId");
CREATE TABLE "PaymentTransaction" (
  "reference" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "ModuleProgress" (
  "studentId" TEXT NOT NULL REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "moduleId" TEXT NOT NULL REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "completedAt" TIMESTAMP(3),
  PRIMARY KEY ("studentId", "moduleId")
);
CREATE TABLE "PublicFormRateLimit" (
  "key" TEXT PRIMARY KEY,
  "count" INTEGER NOT NULL DEFAULT 1,
  "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "PublicFormRateLimit_expiresAt_idx" ON "PublicFormRateLimit"("expiresAt");

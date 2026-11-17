CREATE TABLE "SecurityRateLimit" (
  "key" TEXT PRIMARY KEY,
  "count" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "SecurityRateLimit_expiresAt_idx" ON "SecurityRateLimit"("expiresAt");
-- Counters are internal server state, never tenant-accessible.
REVOKE ALL ON "SecurityRateLimit" FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'closecraft_app') THEN
    REVOKE ALL ON "SecurityRateLimit" FROM closecraft_app;
  END IF;
END $$;

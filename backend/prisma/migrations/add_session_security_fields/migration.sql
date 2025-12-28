-- AlterTable
ALTER TABLE "table_sessions" ADD COLUMN "session_secret" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN "expires_at" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '120 minutes';

-- CreateIndex
CREATE UNIQUE INDEX "table_sessions_session_secret_key" ON "table_sessions"("session_secret");

-- CreateIndex
CREATE INDEX "table_sessions_session_secret_idx" ON "table_sessions"("session_secret");

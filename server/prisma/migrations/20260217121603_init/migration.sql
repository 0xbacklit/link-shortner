-- CreateTable
CREATE TABLE "Link" (
    "id" BIGSERIAL NOT NULL,
    "shortCode" TEXT NOT NULL,
    "longUrl" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Link_shortCode_key" ON "Link"("shortCode");

-- CreateIndex
CREATE INDEX "Link_expiresAt_idx" ON "Link"("expiresAt");

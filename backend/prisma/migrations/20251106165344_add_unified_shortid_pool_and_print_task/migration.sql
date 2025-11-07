/*
  Warnings:

  - The `status` column on the `CableShortIdPool` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ShortIdPoolStatus" AS ENUM ('GENERATED', 'PRINTED', 'BOUND', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('DATA_CENTER', 'ROOM', 'CABINET', 'DEVICE', 'PANEL', 'PORT', 'CABLE');

-- AlterTable
ALTER TABLE "CableShortIdPool" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'AVAILABLE';

-- DropEnum
DROP TYPE "PoolIdStatus";

-- CreateTable
CREATE TABLE "PrintTask" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "count" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "filePath" TEXT,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShortIdPool" (
    "id" TEXT NOT NULL,
    "shortId" INTEGER NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "status" "ShortIdPoolStatus" NOT NULL DEFAULT 'GENERATED',
    "entityId" TEXT,
    "boundAt" TIMESTAMP(3),
    "printTaskId" TEXT,
    "printedAt" TIMESTAMP(3),
    "batchNo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortIdPool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortIdPool_shortId_key" ON "ShortIdPool"("shortId");

-- CreateIndex
CREATE INDEX "ShortIdPool_entityType_status_idx" ON "ShortIdPool"("entityType", "status");

-- CreateIndex
CREATE INDEX "ShortIdPool_shortId_idx" ON "ShortIdPool"("shortId");

-- AddForeignKey
ALTER TABLE "ShortIdPool" ADD CONSTRAINT "ShortIdPool_printTaskId_fkey" FOREIGN KEY ("printTaskId") REFERENCES "PrintTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

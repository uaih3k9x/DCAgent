-- CreateEnum
CREATE TYPE "CableInventoryStatus" AS ENUM ('NOT_INVENTORIED', 'INVENTORIED', 'IN_USE');

-- CreateEnum
CREATE TYPE "PoolIdStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'RESERVED', 'CANCELLED');

-- AlterTable Cable: 添加入库状态字段
ALTER TABLE "Cable" ADD COLUMN "inventoryStatus" "CableInventoryStatus" NOT NULL DEFAULT 'NOT_INVENTORIED';

-- CreateTable CableShortIdPool: 线缆shortID池
CREATE TABLE "CableShortIdPool" (
    "id" TEXT NOT NULL,
    "shortId" INTEGER NOT NULL,
    "status" "PoolIdStatus" NOT NULL DEFAULT 'AVAILABLE',
    "cableId" TEXT,
    "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CableShortIdPool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CableShortIdPool_shortId_key" ON "CableShortIdPool"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "CableShortIdPool_cableId_key" ON "CableShortIdPool"("cableId");

-- AddForeignKey
ALTER TABLE "CableShortIdPool" ADD CONSTRAINT "CableShortIdPool_cableId_fkey" FOREIGN KEY ("cableId") REFERENCES "Cable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

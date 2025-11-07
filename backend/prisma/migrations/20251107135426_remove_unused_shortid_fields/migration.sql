/*
  Warnings:

  - You are about to drop the column `shortId` on the `Cable` table. All the data in the column will be lost.
  - You are about to drop the column `shortId` on the `DataCenter` table. All the data in the column will be lost.
  - You are about to drop the column `shortId` on the `Device` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Cable_shortId_key";

-- DropIndex
DROP INDEX "DataCenter_shortId_key";

-- DropIndex
DROP INDEX "Device_shortId_key";

-- AlterTable
ALTER TABLE "Cable" DROP COLUMN "shortId";

-- AlterTable
ALTER TABLE "DataCenter" DROP COLUMN "shortId";

-- AlterTable
ALTER TABLE "Device" DROP COLUMN "shortId";

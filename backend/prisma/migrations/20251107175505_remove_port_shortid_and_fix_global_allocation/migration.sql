/*
  Warnings:

  - You are about to drop the column `shortId` on the `Port` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Port_shortId_key";

-- AlterTable
ALTER TABLE "Cabinet" ALTER COLUMN "shortId" DROP NOT NULL,
ALTER COLUMN "shortId" DROP DEFAULT;
DROP SEQUENCE "Cabinet_shortId_seq";

-- AlterTable
ALTER TABLE "Port" DROP COLUMN "shortId";

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "shortId" DROP NOT NULL,
ALTER COLUMN "shortId" DROP DEFAULT;
DROP SEQUENCE "Room_shortId_seq";

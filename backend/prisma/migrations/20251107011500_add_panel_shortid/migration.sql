-- AlterTable
ALTER TABLE "Panel" ADD COLUMN "shortId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Panel_shortId_key" ON "Panel"("shortId");

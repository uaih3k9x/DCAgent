-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('SERVER', 'SWITCH', 'ROUTER', 'FIREWALL', 'STORAGE', 'PDU', 'OTHER');

-- CreateEnum
CREATE TYPE "PanelType" AS ENUM ('NETWORK', 'POWER', 'CONSOLE', 'USB', 'MIXED', 'OTHER');

-- CreateEnum
CREATE TYPE "PortStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'FAULTY');

-- CreateEnum
CREATE TYPE "CableType" AS ENUM ('CAT5E', 'CAT6', 'CAT6A', 'CAT7', 'FIBER_SM', 'FIBER_MM', 'QSFP_TO_SFP', 'QSFP_TO_QSFP', 'SFP_TO_SFP', 'POWER', 'OTHER');

-- CreateTable
CREATE TABLE "DataCenter" (
    "id" TEXT NOT NULL,
    "shortId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "shortId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "floor" TEXT,
    "dataCenterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cabinet" (
    "id" TEXT NOT NULL,
    "shortId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "height" INTEGER NOT NULL DEFAULT 42,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cabinet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "shortId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DeviceType" NOT NULL,
    "model" TEXT,
    "serialNo" TEXT,
    "uPosition" INTEGER,
    "uHeight" INTEGER,
    "cabinetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanelTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PanelType" NOT NULL,
    "portCount" INTEGER NOT NULL,
    "description" TEXT,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 482.6,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 44.45,
    "layoutConfig" JSONB,
    "portDefinitions" JSONB NOT NULL,
    "backgroundColor" TEXT,
    "image" TEXT,
    "svgPath" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PanelTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Panel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PanelType" NOT NULL,
    "deviceId" TEXT NOT NULL,
    "templateId" TEXT,
    "isCustomized" BOOLEAN NOT NULL DEFAULT false,
    "positionX" DOUBLE PRECISION,
    "positionY" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "backgroundColor" TEXT,
    "image" TEXT,
    "svgPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Panel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Port" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "label" TEXT,
    "status" "PortStatus" NOT NULL DEFAULT 'AVAILABLE',
    "panelId" TEXT NOT NULL,
    "portType" TEXT,
    "positionX" DOUBLE PRECISION,
    "positionY" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Port_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cable" (
    "id" TEXT NOT NULL,
    "shortId" SERIAL NOT NULL,
    "label" TEXT,
    "type" "CableType" NOT NULL,
    "length" DOUBLE PRECISION,
    "color" TEXT,
    "notes" TEXT,
    "isBranched" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CableEndpoint" (
    "id" TEXT NOT NULL,
    "cableId" TEXT NOT NULL,
    "portId" TEXT NOT NULL,
    "endType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CableEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataCenter_shortId_key" ON "DataCenter"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_shortId_key" ON "Room"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "Cabinet_shortId_key" ON "Cabinet"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_shortId_key" ON "Device"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "Device_serialNo_key" ON "Device"("serialNo");

-- CreateIndex
CREATE UNIQUE INDEX "Port_panelId_number_key" ON "Port"("panelId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Cable_shortId_key" ON "Cable"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "CableEndpoint_cableId_endType_key" ON "CableEndpoint"("cableId", "endType");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_dataCenterId_fkey" FOREIGN KEY ("dataCenterId") REFERENCES "DataCenter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cabinet" ADD CONSTRAINT "Cabinet_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "Cabinet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panel" ADD CONSTRAINT "Panel_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panel" ADD CONSTRAINT "Panel_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PanelTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Port" ADD CONSTRAINT "Port_panelId_fkey" FOREIGN KEY ("panelId") REFERENCES "Panel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CableEndpoint" ADD CONSTRAINT "CableEndpoint_cableId_fkey" FOREIGN KEY ("cableId") REFERENCES "Cable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CableEndpoint" ADD CONSTRAINT "CableEndpoint_portId_fkey" FOREIGN KEY ("portId") REFERENCES "Port"("id") ON DELETE CASCADE ON UPDATE CASCADE;

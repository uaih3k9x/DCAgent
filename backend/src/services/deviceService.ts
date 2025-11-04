import prisma from '../utils/prisma';
import { DeviceType } from '@prisma/client';

export interface CreateDeviceDto {
  name: string;
  type: DeviceType;
  model?: string;
  serialNo?: string;
  uPosition?: number;
  uHeight?: number;
  cabinetId: string;
}

export interface UpdateDeviceDto {
  name?: string;
  type?: DeviceType;
  model?: string;
  serialNo?: string;
  uPosition?: number;
  uHeight?: number;
}

class DeviceService {
  async createDevice(data: CreateDeviceDto) {
    return await prisma.device.create({
      data,
      include: {
        cabinet: true,
        panels: true,
      },
    });
  }

  async getDeviceById(id: string) {
    return await prisma.device.findUnique({
      where: { id },
      include: {
        cabinet: {
          include: {
            room: {
              include: {
                dataCenter: true,
              },
            },
          },
        },
        panels: {
          include: {
            ports: true,
          },
        },
      },
    });
  }

  async getDeviceByShortId(shortId: number) {
    return await prisma.device.findUnique({
      where: { shortId },
      include: {
        cabinet: {
          include: {
            room: {
              include: {
                dataCenter: true,
              },
            },
          },
        },
        panels: {
          include: {
            ports: true,
          },
        },
      },
    });
  }

  async getAllDevices() {
    return await prisma.device.findMany({
      include: {
        cabinet: true,
        panels: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDevicesByCabinet(cabinetId: string) {
    return await prisma.device.findMany({
      where: { cabinetId },
      include: {
        panels: {
          include: {
            ports: true,
          },
        },
      },
      orderBy: {
        uPosition: 'asc',
      },
    });
  }

  async updateDevice(id: string, data: UpdateDeviceDto) {
    return await prisma.device.update({
      where: { id },
      data,
      include: {
        cabinet: true,
        panels: true,
      },
    });
  }

  async deleteDevice(id: string) {
    return await prisma.device.delete({
      where: { id },
    });
  }

  async searchDevices(query: string) {
    return await prisma.device.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { model: { contains: query } },
          { serialNo: { contains: query } },
        ],
      },
      include: {
        cabinet: true,
        panels: true,
      },
    });
  }
}

export default new DeviceService();

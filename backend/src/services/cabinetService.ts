import { PrismaClient, Cabinet } from '@prisma/client';
import { shortIdPoolService } from './shortIdPoolService';

const prisma = new PrismaClient();

export interface CreateCabinetInput {
  name: string;
  shortId: number; // 必须提供shortID
  position?: string;
  height?: number;
  roomId: string;
}

export interface UpdateCabinetInput {
  name?: string;
  position?: string;
  height?: number;
}

class CabinetService {
  async getAllCabinets(): Promise<Cabinet[]> {
    return prisma.cabinet.findMany({
      include: {
        room: {
          include: {
            dataCenter: true,
          },
        },
        devices: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getCabinetById(id: string): Promise<Cabinet | null> {
    return prisma.cabinet.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            dataCenter: true,
          },
        },
        devices: {
          include: {
            panels: {
              include: {
                ports: true,
              },
            },
          },
        },
      },
    });
  }

  async getCabinetByShortId(shortId: number): Promise<Cabinet | null> {
    return prisma.cabinet.findUnique({
      where: { shortId },
      include: {
        room: {
          include: {
            dataCenter: true,
          },
        },
        devices: {
          include: {
            panels: {
              include: {
                ports: true,
              },
            },
          },
        },
      },
    });
  }

  async getCabinetsByRoom(roomId: string): Promise<Cabinet[]> {
    return prisma.cabinet.findMany({
      where: { roomId },
      include: {
        devices: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createCabinet(data: CreateCabinetInput): Promise<Cabinet> {
    // 使用 shortIdPoolService 分配 shortId
    const allocatedShortId = await shortIdPoolService.allocateShortId('CABINET', '', data.shortId);

    // 从data中提取shortId，避免覆盖allocatedShortId
    const { shortId: _, ...cabinetData } = data;

    // 创建机柜
    const cabinet = await prisma.cabinet.create({
      data: {
        ...cabinetData,
        shortId: allocatedShortId,
      },
      include: {
        room: {
          include: {
            dataCenter: true,
          },
        },
        devices: true,
      },
    });

    // 更新 shortIdPool 中的 entityId
    await prisma.shortIdPool.updateMany({
      where: { shortId: allocatedShortId },
      data: { entityId: cabinet.id },
    });

    return cabinet;
  }

  async updateCabinet(id: string, data: UpdateCabinetInput): Promise<Cabinet> {
    return prisma.cabinet.update({
      where: { id },
      data,
      include: {
        room: {
          include: {
            dataCenter: true,
          },
        },
        devices: true,
      },
    });
  }

  async deleteCabinet(id: string): Promise<Cabinet> {
    // 先获取机柜的shortId
    const cabinet = await prisma.cabinet.findUnique({
      where: { id },
      select: { shortId: true },
    });

    // 删除机柜
    const deleted = await prisma.cabinet.delete({
      where: { id },
    });

    // 将shortID释放回池中
    if (cabinet?.shortId) {
      await shortIdPoolService.releaseShortId(cabinet.shortId);
    }

    return deleted;
  }

  async searchCabinets(query: string): Promise<Cabinet[]> {
    return prisma.cabinet.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { position: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        room: {
          include: {
            dataCenter: true,
          },
        },
        devices: true,
      },
    });
  }
}

export default new CabinetService();

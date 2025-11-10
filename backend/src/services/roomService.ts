import { PrismaClient, Room } from '@prisma/client';
import { shortIdPoolService } from './shortIdPoolService';

const prisma = new PrismaClient();

export interface CreateRoomInput {
  name: string;
  shortId: number; // 必须提供shortID
  floor?: string;
  dataCenterId: string;
}

export interface UpdateRoomInput {
  name?: string;
  floor?: string;
}

class RoomService {
  async getAllRooms(): Promise<Room[]> {
    return prisma.room.findMany({
      include: {
        dataCenter: true,
        cabinets: {
          include: {
            devices: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getRoomById(id: string): Promise<Room | null> {
    return prisma.room.findUnique({
      where: { id },
      include: {
        dataCenter: true,
        cabinets: {
          include: {
            devices: true,
          },
        },
      },
    });
  }

  async getRoomByShortId(shortId: number): Promise<Room | null> {
    return prisma.room.findUnique({
      where: { shortId },
      include: {
        dataCenter: true,
        cabinets: {
          include: {
            devices: true,
          },
        },
      },
    });
  }

  async getRoomsByDataCenter(dataCenterId: string): Promise<Room[]> {
    return prisma.room.findMany({
      where: { dataCenterId },
      include: {
        cabinets: {
          include: {
            devices: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createRoom(data: CreateRoomInput): Promise<Room> {
    // 验证shortId是否可用
    const existingCheck = await shortIdPoolService.checkShortIdExists(data.shortId);
    if (existingCheck.exists) {
      throw new Error(`ShortID ${data.shortId} 已被占用: ${existingCheck.usedBy === 'pool' ? '在标签池中' : '已绑定到实体'}`);
    }

    // 创建机房
    const room = await prisma.room.create({
      data,
      include: {
        dataCenter: true,
        cabinets: true,
      },
    });

    // 绑定shortID到池中
    await shortIdPoolService.bindShortIdToEntity(data.shortId, 'ROOM', room.id);

    return room;
  }

  async updateRoom(id: string, data: UpdateRoomInput): Promise<Room> {
    return prisma.room.update({
      where: { id },
      data,
      include: {
        dataCenter: true,
        cabinets: true,
      },
    });
  }

  async deleteRoom(id: string): Promise<Room> {
    // 先获取机房的shortId
    const room = await prisma.room.findUnique({
      where: { id },
      select: { shortId: true },
    });

    // 删除机房
    const deleted = await prisma.room.delete({
      where: { id },
    });

    // 将shortID标记为可重新使用
    if (room?.shortId) {
      await prisma.shortIdPool.updateMany({
        where: { shortId: room.shortId },
        data: {
          status: 'GENERATED',
          entityType: null,
          entityId: null,
          boundAt: null,
        },
      });
    }

    return deleted;
  }

  async searchRooms(query: string): Promise<Room[]> {
    return prisma.room.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { floor: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        dataCenter: true,
        cabinets: true,
      },
    });
  }
}

export default new RoomService();

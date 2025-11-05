import prisma from '../utils/prisma';
import { PortStatus } from '@prisma/client';

export interface CreatePortDto {
  number: string;
  label?: string;
  status?: PortStatus;
  panelId: string;
  // 物理布局（相对于面板的坐标）
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
}

export interface UpdatePortDto {
  number?: string;
  label?: string;
  status?: PortStatus;
  // 物理布局 - 支持两种格式
  position?: {
    x: number;
    y: number;
  };
  positionX?: number;
  positionY?: number;
  size?: {
    width: number;
    height: number;
  };
  width?: number;
  height?: number;
}

class PortService {
  async createPort(data: CreatePortDto) {
    return await prisma.port.create({
      data: {
        ...data,
        status: data.status || PortStatus.AVAILABLE,
      },
      include: {
        panel: {
          include: {
            device: true,
          },
        },
      },
    });
  }

  async createBulkPorts(panelId: string, count: number, prefix: string = 'Port-') {
    const ports = [];
    for (let i = 1; i <= count; i++) {
      ports.push({
        number: String(i),
        label: `${prefix}${i}`,
        panelId,
        status: PortStatus.AVAILABLE,
      });
    }

    return await prisma.port.createMany({
      data: ports,
      skipDuplicates: true,
    });
  }

  async getPortById(id: string) {
    return await prisma.port.findUnique({
      where: { id },
      include: {
        panel: {
          include: {
            device: {
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
              },
            },
          },
        },
        cableEndpoints: {
          include: {
            cable: true,
          },
        },
      },
    });
  }

  async getPortByShortId(shortId: number) {
    return await prisma.port.findUnique({
      where: { shortId },
      include: {
        panel: {
          include: {
            device: {
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
              },
            },
          },
        },
      },
    });
  }

  async getAllPorts() {
    return await prisma.port.findMany({
      include: {
        panel: {
          include: {
            device: true,
          },
        },
      },
      orderBy: [
        { panelId: 'asc' },
        { number: 'asc' },
      ],
    });
  }

  async getPortsByPanel(panelId: string) {
    return await prisma.port.findMany({
      where: { panelId },
      include: {
        cableEndpoints: {
          include: {
            cable: true,
          },
        },
      },
      orderBy: {
        number: 'asc',
      },
    });
  }

  async getPortsByStatus(status: PortStatus) {
    return await prisma.port.findMany({
      where: { status },
      include: {
        panel: {
          include: {
            device: true,
          },
        },
      },
    });
  }

  async updatePort(id: string, data: UpdatePortDto) {
    // 处理 position 和 size 对象
    const { position, size, ...restData } = data;
    const portData = {
      ...restData,
      ...(position && { positionX: position.x, positionY: position.y }),
      ...(size && { width: size.width, height: size.height }),
    };

    return await prisma.port.update({
      where: { id },
      data: portData,
      include: {
        panel: {
          include: {
            device: true,
          },
        },
      },
    });
  }

  async updatePortStatus(id: string, status: PortStatus) {
    return await prisma.port.update({
      where: { id },
      data: { status },
      include: {
        panel: true,
      },
    });
  }

  async deletePort(id: string) {
    return await prisma.port.delete({
      where: { id },
    });
  }

  async searchPorts(query: string) {
    return await prisma.port.findMany({
      where: {
        OR: [
          { number: { contains: query } },
          { label: { contains: query } },
          { panel: { name: { contains: query } } },
          { panel: { device: { name: { contains: query } } } },
        ],
      },
      include: {
        panel: {
          include: {
            device: true,
          },
        },
      },
    });
  }

  async getAvailablePortsByPanel(panelId: string) {
    return await prisma.port.findMany({
      where: {
        panelId,
        status: PortStatus.AVAILABLE,
      },
      orderBy: {
        number: 'asc',
      },
    });
  }
}

export default new PortService();

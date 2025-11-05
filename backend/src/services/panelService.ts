import prisma from '../utils/prisma';
import { PanelType } from '@prisma/client';

export interface CreatePanelDto {
  name: string;
  type: PanelType;
  deviceId: string;
  // 模板相关
  templateId?: string;
  isCustomized?: boolean;
  // 物理布局
  positionX?: number;
  positionY?: number;
  size?: {
    width: number;
    height: number;
  };
  width?: number;
  height?: number;
  // 视觉样式
  backgroundColor?: string | null;
  image?: string | null;
  svgPath?: string | null;
}

export interface UpdatePanelDto {
  name?: string;
  type?: PanelType;
  // 模板相关
  templateId?: string | null;
  isCustomized?: boolean;
  // 物理布局
  positionX?: number;
  positionY?: number;
  size?: {
    width: number;
    height: number;
  };
  width?: number;
  height?: number;
  // 视觉样式
  backgroundColor?: string | null;
  image?: string | null;
  svgPath?: string | null;
}

class PanelService {
  async createPanel(data: CreatePanelDto) {
    // 处理 size 对象：如果提供了 size，则使用 size.width 和 size.height
    const { size, ...restData } = data;
    const panelData = {
      ...restData,
      width: size?.width ?? data.width,
      height: size?.height ?? data.height,
    };

    return await prisma.panel.create({
      data: panelData,
      include: {
        device: true,
        ports: true,
      },
    });
  }

  async getPanelById(id: string) {
    return await prisma.panel.findUnique({
      where: { id },
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
        ports: {
          orderBy: {
            number: 'asc',
          },
        },
      },
    });
  }

  async getPanelByShortId(shortId: number) {
    return await prisma.panel.findUnique({
      where: { shortId },
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
        ports: {
          orderBy: {
            number: 'asc',
          },
        },
      },
    });
  }

  async getAllPanels() {
    return await prisma.panel.findMany({
      include: {
        device: true,
        ports: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPanelsByDevice(deviceId: string) {
    return await prisma.panel.findMany({
      where: { deviceId },
      include: {
        ports: {
          orderBy: {
            number: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getPanelsByType(type: PanelType) {
    return await prisma.panel.findMany({
      where: { type },
      include: {
        device: true,
        ports: true,
      },
    });
  }

  async updatePanel(id: string, data: UpdatePanelDto) {
    // 处理 size 对象：如果提供了 size，则使用 size.width 和 size.height
    const { size, ...restData } = data;
    const panelData = {
      ...restData,
      ...(size && { width: size.width, height: size.height }),
    };

    return await prisma.panel.update({
      where: { id },
      data: panelData,
      include: {
        device: true,
        ports: true,
      },
    });
  }

  async deletePanel(id: string) {
    return await prisma.panel.delete({
      where: { id },
    });
  }

  async searchPanels(query: string) {
    return await prisma.panel.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { device: { name: { contains: query } } },
        ],
      },
      include: {
        device: true,
        ports: true,
      },
    });
  }
}

export default new PanelService();

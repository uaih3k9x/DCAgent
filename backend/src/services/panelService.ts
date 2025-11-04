import prisma from '../utils/prisma';
import { PanelType } from '@prisma/client';

export interface CreatePanelDto {
  name: string;
  type: PanelType;
  deviceId: string;
  // 物理布局
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  // 视觉样式
  backgroundColor?: string;
  image?: string;
  svgPath?: string;
}

export interface UpdatePanelDto {
  name?: string;
  type?: PanelType;
  // 物理布局
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  // 视觉样式
  backgroundColor?: string;
  image?: string;
  svgPath?: string;
}

class PanelService {
  async createPanel(data: CreatePanelDto) {
    return await prisma.panel.create({
      data,
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
    return await prisma.panel.update({
      where: { id },
      data,
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

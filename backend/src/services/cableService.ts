import prisma from '../utils/prisma';
import cableGraphService from '../graph/cableGraph';
import { CableType } from '@prisma/client';

export interface CreateCableDto {
  label?: string;
  type: CableType;
  length?: number;
  color?: string;
  notes?: string;
  portAId: string;
  portBId: string;
}

export interface UpdateCableDto {
  label?: string;
  type?: CableType;
  length?: number;
  color?: string;
  notes?: string;
}

class CableService {
  /**
   * 创建线缆并建立连接关系
   */
  async createCable(data: CreateCableDto) {
    const { portAId, portBId, ...cableData } = data;

    // 检查端口是否存在
    const portA = await prisma.port.findUnique({ where: { id: portAId } });
    const portB = await prisma.port.findUnique({ where: { id: portBId } });

    if (!portA || !portB) {
      throw new Error('One or both ports not found');
    }

    // 检查端口是否已被占用
    if (portA.status === 'OCCUPIED' || portB.status === 'OCCUPIED') {
      throw new Error('One or both ports are already occupied');
    }

    // 创建线缆记录
    const cable = await prisma.cable.create({
      data: cableData,
    });

    // 在图数据库中创建连接关系
    await cableGraphService.createConnection({
      cableId: cable.id,
      portAId,
      portBId,
    });

    // 更新端口状态
    await prisma.port.update({
      where: { id: portAId },
      data: { status: 'OCCUPIED' },
    });
    await prisma.port.update({
      where: { id: portBId },
      data: { status: 'OCCUPIED' },
    });

    return cable;
  }

  /**
   * 获取线缆详情（包含连接的端口信息）
   */
  async getCableById(id: string) {
    const cable = await prisma.cable.findUnique({
      where: { id },
    });

    if (!cable) {
      return null;
    }

    // 从图数据库查询连接关系
    // 这里需要实现一个查询特定线缆的连接端口的方法
    // 简化处理，返回基本信息
    return cable;
  }

  /**
   * 获取所有线缆
   */
  async getAllCables() {
    return await prisma.cable.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 更新线缆信息
   */
  async updateCable(id: string, data: UpdateCableDto) {
    return await prisma.cable.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除线缆（同时删除图数据库中的连接关系）
   */
  async deleteCable(id: string) {
    // 查找连接的端口并释放
    // 这里需要先从图数据库查询连接的端口

    // 从图数据库删除连接关系
    await cableGraphService.deleteConnection(id);

    // 删除线缆记录
    return await prisma.cable.delete({
      where: { id },
    });
  }

  /**
   * 查询端口的连接情况
   */
  async getPortConnection(portId: string) {
    const connectedPortId = await cableGraphService.findConnectedPort(portId);

    if (!connectedPortId) {
      return null;
    }

    const connectedPort = await prisma.port.findUnique({
      where: { id: connectedPortId },
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

    return connectedPort;
  }

  /**
   * 查询面板的所有连接
   */
  async getPanelConnections(panelId: string) {
    return await cableGraphService.findPanelConnections(panelId);
  }

  /**
   * 查询网状拓扑
   */
  async getNetworkTopology(panelId: string, maxDepth: number = 3) {
    return await cableGraphService.findNetworkTopology(panelId, maxDepth);
  }
}

export default new CableService();

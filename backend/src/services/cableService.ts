import prisma from '../utils/prisma';
import cableGraphService from '../graph/cableGraph';
import { CableType } from '@prisma/client';
import { cableShortIdPoolService } from './cableShortIdPoolService';

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

export interface ManualInventoryCableDto {
  shortIdA: number;  // 端口A的shortID（扫码输入）
  shortIdB: number;  // 端口B的shortID（扫码输入）
  label?: string;
  type: CableType;
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
    const portA = await prisma.port.findUnique({
      where: { id: portAId },
      include: { panel: true },
    });
    const portB = await prisma.port.findUnique({
      where: { id: portBId },
      include: { panel: true },
    });

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

    // 同步端口和面板信息到Neo4j
    if (portA.panel) {
      await cableGraphService.syncPanelNode(portA.panel.id, portA.panel);
    }
    await cableGraphService.syncPortNode(portAId, {
      ...portA,
      panelId: portA.panelId,
    });

    if (portB.panel) {
      await cableGraphService.syncPanelNode(portB.panel.id, portB.panel);
    }
    await cableGraphService.syncPortNode(portBId, {
      ...portB,
      panelId: portB.panelId,
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
   * 通过 shortId 获取线缆详情
   */
  async getCableByShortId(shortId: number) {
    const cable = await prisma.cable.findUnique({
      where: { shortId },
    });

    if (!cable) {
      return null;
    }

    // 从图数据库查询连接关系
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
   * 搜索线缆（根据标签、颜色、备注）
   */
  async searchCables(query: string) {
    return await prisma.cable.findMany({
      where: {
        OR: [
          { label: { contains: query, mode: 'insensitive' } },
          { color: { contains: query, mode: 'insensitive' } },
          { notes: { contains: query, mode: 'insensitive' } },
        ],
      },
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

  /**
   * 获取线缆连接的端点信息（用于扫码跳转）
   * 返回线缆及其连接的两个端口的完整信息（包括所在面板、设备、机柜等层级）
   */
  async getCableEndpoints(cableId: string) {
    // 获取线缆基本信息
    const cable = await prisma.cable.findUnique({
      where: { id: cableId },
    });

    if (!cable) {
      return null;
    }

    // 从图数据库查询连接的两个端口ID
    const portIds = await cableGraphService.getCablePortIds(cableId);

    if (!portIds || portIds.length !== 2) {
      return {
        cable,
        portA: null,
        portB: null,
      };
    }

    // 查询两个端口的完整信息
    const portA = await prisma.port.findUnique({
      where: { id: portIds[0] },
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

    const portB = await prisma.port.findUnique({
      where: { id: portIds[1] },
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

    return {
      cable,
      portA,
      portB,
    };
  }

  /**
   * 通过线缆的 shortId 获取端点信息
   */
  async getCableEndpointsByShortId(shortId: number) {
    const cable = await prisma.cable.findUnique({
      where: { shortId },
    });

    if (!cable) {
      return null;
    }

    return await this.getCableEndpoints(cable.id);
  }

  /**
   * 手动入库：通过扫描两端端口的shortID来创建线缆连接
   * 会自动检查shortID重复并报警
   */
  async manualInventoryCable(data: ManualInventoryCableDto) {
    const { shortIdA, shortIdB, ...cableData } = data;

    // 1. 检查两个shortID是否重复
    if (shortIdA === shortIdB) {
      throw new Error('线缆两端的shortID不能相同');
    }

    // 2. 通过shortID查找端口A
    const portA = await prisma.port.findUnique({
      where: { shortId: shortIdA },
      include: { panel: true },
    });

    if (!portA) {
      throw new Error(`端口A (shortID: ${shortIdA}) 不存在，请检查扫码是否正确`);
    }

    // 3. 通过shortID查找端口B
    const portB = await prisma.port.findUnique({
      where: { shortId: shortIdB },
      include: { panel: true },
    });

    if (!portB) {
      throw new Error(`端口B (shortID: ${shortIdB}) 不存在，请检查扫码是否正确`);
    }

    // 4. 检查端口是否已被占用
    if (portA.status === 'OCCUPIED') {
      throw new Error(`端口A (${portA.label || portA.number}) 已被占用`);
    }

    if (portB.status === 'OCCUPIED') {
      throw new Error(`端口B (${portB.label || portB.number}) 已被占用`);
    }

    // 5. 创建线缆记录（状态为INVENTORIED）
    const cable = await prisma.cable.create({
      data: {
        ...cableData,
        inventoryStatus: 'INVENTORIED', // 已入库
      },
    });

    // 6. 同步端口和面板信息到Neo4j
    if (portA.panel) {
      await cableGraphService.syncPanelNode(portA.panel.id, portA.panel);
    }
    await cableGraphService.syncPortNode(portA.id, {
      ...portA,
      panelId: portA.panelId,
    });

    if (portB.panel) {
      await cableGraphService.syncPanelNode(portB.panel.id, portB.panel);
    }
    await cableGraphService.syncPortNode(portB.id, {
      ...portB,
      panelId: portB.panelId,
    });

    // 7. 在图数据库中创建连接关系
    await cableGraphService.createConnection({
      cableId: cable.id,
      portAId: portA.id,
      portBId: portB.id,
    });

    // 8. 更新端口状态为OCCUPIED
    await prisma.port.update({
      where: { id: portA.id },
      data: { status: 'OCCUPIED' },
    });
    await prisma.port.update({
      where: { id: portB.id },
      data: { status: 'OCCUPIED' },
    });

    return cable;
  }

  /**
   * 检查线缆shortID是否已被使用
   * 用于在打印标签前验证shortID的可用性
   */
  async checkCableShortIdAvailable(shortId: number) {
    const result = await cableShortIdPoolService.checkShortIdExists(shortId);

    if (result.exists) {
      return {
        available: false,
        message: `shortID ${shortId} 已被占用`,
        usedBy: result.usedBy,
        details: result.details,
      };
    }

    return {
      available: true,
      message: `shortID ${shortId} 可用`,
    };
  }

  /**
   * 批量检查多个shortID的可用性
   */
  async checkMultipleShortIds(shortIds: number[]) {
    const results = await Promise.all(
      shortIds.map(async (shortId) => {
        const result = await this.checkCableShortIdAvailable(shortId);
        return {
          shortId,
          ...result,
        };
      })
    );

    const duplicates = results.filter((r) => !r.available);

    if (duplicates.length > 0) {
      return {
        hasConflict: true,
        message: `发现 ${duplicates.length} 个shortID冲突`,
        conflicts: duplicates,
        available: results.filter((r) => r.available),
      };
    }

    return {
      hasConflict: false,
      message: '所有shortID均可用',
      available: results,
    };
  }
}

export default new CableService();


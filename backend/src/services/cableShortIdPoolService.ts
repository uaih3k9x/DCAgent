import { prisma } from '../utils/prisma';
import { PoolIdStatus } from '@prisma/client';

export class CableShortIdPoolService {
  /**
   * 批量生成可用的shortID到池中
   * @param count 生成数量
   * @param notes 批次备注
   * @returns 生成的shortID列表
   */
  async generateShortIds(count: number, notes?: string): Promise<number[]> {
    if (count <= 0 || count > 10000) {
      throw new Error('生成数量必须在 1-10000 之间');
    }

    // 1. 查找当前最大的shortID（从Cable和Pool表中）
    const maxCableShortId = await prisma.cable.findFirst({
      orderBy: { shortId: 'desc' },
      select: { shortId: true },
    });

    const maxPoolShortId = await prisma.cableShortIdPool.findFirst({
      orderBy: { shortId: 'desc' },
      select: { shortId: true },
    });

    const currentMax = Math.max(
      maxCableShortId?.shortId || 0,
      maxPoolShortId?.shortId || 0
    );

    // 2. 从currentMax + 1开始生成连续的shortID
    const generatedIds: number[] = [];
    const poolRecords = [];

    for (let i = 1; i <= count; i++) {
      const newShortId = currentMax + i;
      generatedIds.push(newShortId);
      poolRecords.push({
        shortId: newShortId,
        status: PoolIdStatus.AVAILABLE,
        notes: notes || `批次生成 ${new Date().toISOString()}`,
      });
    }

    // 3. 批量插入到池中
    await prisma.cableShortIdPool.createMany({
      data: poolRecords,
    });

    return generatedIds;
  }

  /**
   * 检查shortID是否已被占用（Cable表或Pool表）
   * @param shortId 要检查的shortID
   * @returns { exists: boolean, usedBy: 'cable' | 'pool' | null }
   */
  async checkShortIdExists(shortId: number): Promise<{
    exists: boolean;
    usedBy: 'cable' | 'pool' | null;
    details?: any;
  }> {
    // 检查Cable表
    const cable = await prisma.cable.findUnique({
      where: { shortId },
      select: { id: true, label: true, type: true, inventoryStatus: true },
    });

    if (cable) {
      return {
        exists: true,
        usedBy: 'cable',
        details: cable,
      };
    }

    // 检查Pool表
    const poolRecord = await prisma.cableShortIdPool.findUnique({
      where: { shortId },
      select: { id: true, status: true, cableId: true, notes: true },
    });

    if (poolRecord) {
      return {
        exists: true,
        usedBy: 'pool',
        details: poolRecord,
      };
    }

    return {
      exists: false,
      usedBy: null,
    };
  }

  /**
   * 获取所有可用的shortID（状态为AVAILABLE）
   * @param limit 限制数量
   * @returns 可用shortID列表
   */
  async getAvailableShortIds(limit?: number): Promise<number[]> {
    const records = await prisma.cableShortIdPool.findMany({
      where: { status: PoolIdStatus.AVAILABLE },
      orderBy: { shortId: 'asc' },
      take: limit,
      select: { shortId: true },
    });

    return records.map((r) => r.shortId);
  }

  /**
   * 标记shortID为使用中（绑定线缆时调用）
   * @param shortId
   * @param cableId 绑定的线缆ID
   */
  async markAsUsed(shortId: number, cableId: string): Promise<void> {
    await prisma.cableShortIdPool.update({
      where: { shortId },
      data: {
        status: PoolIdStatus.IN_USE,
        cableId,
        usedAt: new Date(),
      },
    });
  }

  /**
   * 释放shortID（删除线缆时调用，将状态改回AVAILABLE）
   * @param shortId
   */
  async releaseShortId(shortId: number): Promise<void> {
    await prisma.cableShortIdPool.update({
      where: { shortId },
      data: {
        status: PoolIdStatus.AVAILABLE,
        cableId: null,
        usedAt: null,
      },
    });
  }

  /**
   * 标记shortID为作废
   * @param shortId
   * @param reason 作废原因
   */
  async cancelShortId(shortId: number, reason?: string): Promise<void> {
    await prisma.cableShortIdPool.update({
      where: { shortId },
      data: {
        status: PoolIdStatus.CANCELLED,
        notes: reason || '已作废',
      },
    });
  }

  /**
   * 获取池统计信息
   */
  async getPoolStats(): Promise<{
    total: number;
    available: number;
    inUse: number;
    reserved: number;
    cancelled: number;
  }> {
    const [total, available, inUse, reserved, cancelled] = await Promise.all([
      prisma.cableShortIdPool.count(),
      prisma.cableShortIdPool.count({ where: { status: PoolIdStatus.AVAILABLE } }),
      prisma.cableShortIdPool.count({ where: { status: PoolIdStatus.IN_USE } }),
      prisma.cableShortIdPool.count({ where: { status: PoolIdStatus.RESERVED } }),
      prisma.cableShortIdPool.count({ where: { status: PoolIdStatus.CANCELLED } }),
    ]);

    return { total, available, inUse, reserved, cancelled };
  }

  /**
   * 获取池中的所有记录（分页）
   */
  async getPoolRecords(page = 1, pageSize = 50) {
    const skip = (page - 1) * pageSize;

    const [records, total] = await Promise.all([
      prisma.cableShortIdPool.findMany({
        skip,
        take: pageSize,
        orderBy: { shortId: 'asc' },
        include: {
          cable: {
            select: {
              id: true,
              label: true,
              type: true,
              inventoryStatus: true,
            },
          },
        },
      }),
      prisma.cableShortIdPool.count(),
    ]);

    return {
      records,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

export const cableShortIdPoolService = new CableShortIdPoolService();

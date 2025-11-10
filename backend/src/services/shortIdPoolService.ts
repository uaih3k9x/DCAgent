import prisma from '../utils/prisma';
import { EntityType, ShortIdPoolStatus } from '@prisma/client';
import { ShortIdFormatter } from '../utils/shortIdFormatter';

export class ShortIdPoolService {
  /**
   * 批量生成shortID到池中
   * @param count 生成数量
   * @param batchNo 批次号（可选）
   * @returns 生成的shortID列表
   */
  async generateShortIds(
    count: number,
    batchNo?: string
  ): Promise<number[]> {
    if (count <= 0 || count > 10000) {
      throw new Error('生成数量必须在 1-10000 之间');
    }

    // 1. 查找当前最大的shortID（从所有类型的Pool表和所有实体表中）
    // 注意：shortId是全局唯一的，需要查询所有表的最大值
    const maxPoolShortId = await prisma.shortIdPool.findFirst({
      orderBy: { shortId: 'desc' },
      select: { shortId: true },
    });

    // 从所有实体表查找最大shortID（因为shortId是全局唯一的）
    const [cable, port, device, cabinet, room, dataCenter] = await Promise.all([
      prisma.cable.findFirst({ orderBy: { shortId: 'desc' }, select: { shortId: true } }),
      prisma.port.findFirst({ orderBy: { shortId: 'desc' }, select: { shortId: true } }),
      prisma.device.findFirst({ orderBy: { shortId: 'desc' }, select: { shortId: true } }),
      prisma.cabinet.findFirst({ orderBy: { shortId: 'desc' }, select: { shortId: true } }),
      prisma.room.findFirst({ orderBy: { shortId: 'desc' }, select: { shortId: true } }),
      prisma.dataCenter.findFirst({ orderBy: { shortId: 'desc' }, select: { shortId: true } }),
    ]);

    const maxEntityShortId = Math.max(
      cable?.shortId || 0,
      port?.shortId || 0,
      device?.shortId || 0,
      cabinet?.shortId || 0,
      room?.shortId || 0,
      dataCenter?.shortId || 0
    );

    const currentMax = Math.max(maxPoolShortId?.shortId || 0, maxEntityShortId);

    // 2. 从currentMax + 1开始生成连续的shortID
    const generatedIds: number[] = [];
    const poolRecords = [];

    for (let i = 1; i <= count; i++) {
      const newShortId = currentMax + i;
      generatedIds.push(newShortId);
      poolRecords.push({
        shortId: newShortId,
        status: ShortIdPoolStatus.GENERATED,
        batchNo: batchNo || `batch_${new Date().toISOString().split('T')[0]}`,
      });
    }

    // 3. 批量插入到池中
    await prisma.shortIdPool.createMany({
      data: poolRecords,
    });

    return generatedIds;
  }

  /**
   * 创建打印任务并生成shortID
   * @param name 任务名称
   * @param count 打印数量
   * @param createdBy 创建人
   * @param notes 备注
   * @returns 打印任务和shortID列表
   */
  async createPrintTask(
    name: string,
    count: number,
    createdBy?: string,
    notes?: string
  ) {
    // 1. 生成shortID
    const shortIds = await this.generateShortIds(count, name);

    // 2. 创建打印任务
    const printTask = await prisma.printTask.create({
      data: {
        name,
        count,
        status: 'PENDING',
        createdBy,
        notes,
      },
    });

    // 3. 关联shortID到打印任务，并标记为PRINTED
    await prisma.shortIdPool.updateMany({
      where: {
        shortId: { in: shortIds },
      },
      data: {
        printTaskId: printTask.id,
        status: ShortIdPoolStatus.PRINTED,
        printedAt: new Date(),
      },
    });

    return {
      printTask,
      shortIds,
    };
  }

  /**
   * 获取打印任务的shortID列表（用于导出CSV/Excel）
   */
  async getPrintTaskShortIds(taskId: string): Promise<{
    task: any;
    shortIds: number[];
  }> {
    const task = await prisma.printTask.findUnique({
      where: { id: taskId },
      include: {
        shortIds: {
          orderBy: { shortId: 'asc' },
        },
      },
    });

    if (!task) {
      throw new Error('打印任务不存在');
    }

    return {
      task,
      shortIds: task.shortIds.map((s) => s.shortId),
    };
  }

  /**
   * 标记打印任务为完成
   */
  async completePrintTask(taskId: string, filePath?: string) {
    return await prisma.printTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        filePath,
        completedAt: new Date(),
      },
    });
  }

  /**
   * 检查shortID是否已被占用
   */
  async checkShortIdExists(
    shortId: number
  ): Promise<{
    exists: boolean;
    usedBy: 'entity' | 'pool' | null;
    entityType?: EntityType;
    details?: any;
  }> {
    // 检查Pool表
    const poolRecord = await prisma.shortIdPool.findFirst({
      where: { shortId },
      select: { id: true, status: true, entityType: true, entityId: true, notes: true, batchNo: true },
    });

    if (poolRecord) {
      return {
        exists: true,
        usedBy: 'pool',
        entityType: poolRecord.entityType || undefined,
        details: poolRecord,
      };
    }

    // 检查所有有 shortId 字段的实体表
    const [panel, cabinet, room] = await Promise.all([
      prisma.panel.findUnique({
        where: { shortId },
        select: { id: true, name: true, type: true },
      }),
      prisma.cabinet.findUnique({
        where: { shortId },
        select: { id: true, name: true },
      }),
      prisma.room.findUnique({
        where: { shortId },
        select: { id: true, name: true },
      }),
    ]);

    if (panel) {
      return { exists: true, usedBy: 'entity', entityType: 'PANEL', details: panel };
    }
    if (cabinet) {
      return { exists: true, usedBy: 'entity', entityType: 'CABINET', details: cabinet };
    }
    if (room) {
      return { exists: true, usedBy: 'entity', entityType: 'ROOM', details: room };
    }

    return {
      exists: false,
      usedBy: null,
    };
  }

  /**
   * 绑定shortID到实体
   */
  async bindShortIdToEntity(
    shortId: number,
    entityType: EntityType,
    entityId: string
  ) {
    await prisma.shortIdPool.updateMany({
      where: {
        shortId,
        status: { not: ShortIdPoolStatus.CANCELLED },
      },
      data: {
        entityType,
        entityId,
        status: ShortIdPoolStatus.BOUND,
        boundAt: new Date(),
      },
    });
  }

  /**
   * 标记shortID为报废
   */
  async cancelShortId(
    shortId: number,
    reason?: string
  ) {
    await prisma.shortIdPool.updateMany({
      where: { shortId },
      data: {
        status: ShortIdPoolStatus.CANCELLED,
        notes: reason || '已报废',
      },
    });
  }

  /**
   * 获取池统计信息
   */
  async getPoolStats(entityType?: EntityType): Promise<{
    total: number;
    generated: number;
    printed: number;
    bound: number;
    cancelled: number;
    byType?: Record<string, number>;
  }> {
    const where = entityType ? { entityType } : {};

    const [total, generated, printed, bound, cancelled] = await Promise.all([
      prisma.shortIdPool.count({ where }),
      prisma.shortIdPool.count({ where: { ...where, status: ShortIdPoolStatus.GENERATED } }),
      prisma.shortIdPool.count({ where: { ...where, status: ShortIdPoolStatus.PRINTED } }),
      prisma.shortIdPool.count({ where: { ...where, status: ShortIdPoolStatus.BOUND } }),
      prisma.shortIdPool.count({ where: { ...where, status: ShortIdPoolStatus.CANCELLED } }),
    ]);

    const result: any = { total, generated, printed, bound, cancelled };

    // 如果没有指定类型，统计各类型数量
    if (!entityType) {
      const byTypeRecords = await prisma.shortIdPool.groupBy({
        by: ['entityType'],
        _count: {
          _all: true,
        },
      });

      result.byType = byTypeRecords.reduce((acc, r) => {
        acc[r.entityType] = r._count._all;
        return acc;
      }, {} as Record<string, number>);
    }

    return result;
  }

  /**
   * 获取池记录（分页）
   */
  async getPoolRecords(params: {
    page?: number;
    pageSize?: number;
    entityType?: EntityType;
    status?: ShortIdPoolStatus;
    batchNo?: string;
    search?: string; // 搜索shortID
  }) {
    const { page = 1, pageSize = 50, entityType, status, batchNo, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (status) where.status = status;
    if (batchNo) where.batchNo = batchNo;
    if (search) {
      const searchId = parseInt(search, 10);
      if (!isNaN(searchId)) {
        where.shortId = searchId;
      }
    }

    const [records, total] = await Promise.all([
      prisma.shortIdPool.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { shortId: 'desc' },
        include: {
          printTask: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      }),
      prisma.shortIdPool.count({ where }),
    ]);

    return {
      records,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取所有打印任务
   */
  async getPrintTasks(params: {
    page?: number;
    pageSize?: number;
    status?: string;
  }) {
    const { page = 1, pageSize = 50, status } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (status) where.status = status;

    const [records, total] = await Promise.all([
      prisma.printTask.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { shortIds: true },
          },
        },
      }),
      prisma.printTask.count({ where }),
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

export const shortIdPoolService = new ShortIdPoolService();

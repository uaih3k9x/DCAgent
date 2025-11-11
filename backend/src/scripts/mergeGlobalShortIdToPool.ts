import prisma from '../utils/prisma';

/**
 * 将 GlobalShortIDAllocation 的数据迁移到 ShortIDPool
 * 执行命令: npx tsx src/scripts/mergeGlobalShortIdToPool.ts
 */

// 将 GlobalShortIdAllocation 的 entityType 转换为 ShortIdPool 的 EntityType
function convertEntityType(globalType: string): string {
  const typeMap: Record<string, string> = {
    'Room': 'ROOM',
    'Cabinet': 'CABINET',
    'Panel': 'PANEL',
    'Port': 'PORT',
    'CableEndpoint': 'CABLE_ENDPOINT',
    // 兼容已经是大写的情况
    'ROOM': 'ROOM',
    'CABINET': 'CABINET',
    'PANEL': 'PANEL',
    'PORT': 'PORT',
    'CABLE_ENDPOINT': 'CABLE_ENDPOINT'
  };

  return typeMap[globalType] || globalType.toUpperCase();
}

async function mergeGlobalShortIdToPool() {
  console.log('========================================');
  console.log('开始迁移 GlobalShortIDAllocation → ShortIDPool');
  console.log('========================================\n');

  try {
    // 1. 获取所有 GlobalShortIDAllocation 记录
    const allocations = await prisma.globalShortIdAllocation.findMany({
      orderBy: { shortId: 'asc' }
    });

    console.log(`📊 找到 ${allocations.length} 条 GlobalShortIDAllocation 记录\n`);

    if (allocations.length === 0) {
      console.log('✅ 没有需要迁移的数据');
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;
    const conflicts: Array<{ shortId: number; poolData: any; globalData: any }> = [];

    // 2. 逐条检查并迁移
    for (const alloc of allocations) {
      // 检查 ShortIDPool 中是否已存在
      const existing = await prisma.shortIdPool.findUnique({
        where: { shortId: alloc.shortId }
      });

      if (existing) {
        // 已存在，检查是否一致
        if (existing.entityType !== alloc.entityType || existing.entityId !== alloc.entityId) {
          conflicts.push({
            shortId: alloc.shortId,
            poolData: { type: existing.entityType, id: existing.entityId, status: existing.status },
            globalData: { type: alloc.entityType, id: alloc.entityId }
          });

          // 如果 Pool 中的 entityId 为空，则更新为 Global 中的数据
          if (!existing.entityId && alloc.entityId) {
            await prisma.shortIdPool.update({
              where: { shortId: alloc.shortId },
              data: {
                entityType: convertEntityType(alloc.entityType) as any,
                entityId: alloc.entityId,
                status: 'BOUND',
                boundAt: alloc.createdAt
              }
            });
            console.log(`🔄 更新 shortId=${alloc.shortId} (${alloc.entityType}:${alloc.entityId})`);
            updatedCount++;
          } else {
            console.log(`⚠️  冲突 shortId=${alloc.shortId}: Pool[${existing.entityType}:${existing.entityId}] vs Global[${alloc.entityType}:${alloc.entityId}]`);
            skippedCount++;
          }
        } else {
          // 数据一致，跳过
          skippedCount++;
        }
      } else {
        // 不存在，创建新记录
        await prisma.shortIdPool.create({
          data: {
            shortId: alloc.shortId,
            entityType: convertEntityType(alloc.entityType) as any,
            entityId: alloc.entityId || undefined,
            status: alloc.entityId ? 'BOUND' : 'GENERATED',
            boundAt: alloc.entityId ? alloc.createdAt : undefined,
            createdAt: alloc.createdAt
          }
        });
        console.log(`✅ 迁移 shortId=${alloc.shortId} (${alloc.entityType}${alloc.entityId ? ':' + alloc.entityId : ''})`);
        migratedCount++;
      }
    }

    console.log('\n========================================');
    console.log('迁移完成！');
    console.log('========================================');
    console.log(`✅ 新增记录: ${migratedCount}`);
    console.log(`🔄 更新记录: ${updatedCount}`);
    console.log(`⏭️  跳过记录: ${skippedCount}`);

    if (conflicts.length > 0) {
      console.log(`\n⚠️  发现 ${conflicts.length} 个冲突:`);
      conflicts.forEach(({ shortId, poolData, globalData }) => {
        console.log(`  - shortId=${shortId}:`);
        console.log(`    Pool:   ${poolData.type}:${poolData.id} (${poolData.status})`);
        console.log(`    Global: ${globalData.type}:${globalData.id}`);
      });
    }

    // 3. 验证迁移结果
    console.log('\n========================================');
    console.log('验证迁移结果');
    console.log('========================================');

    const poolCount = await prisma.shortIdPool.count();
    const globalCount = await prisma.globalShortIdAllocation.count();

    console.log(`ShortIDPool 总记录数: ${poolCount}`);
    console.log(`GlobalShortIDAllocation 总记录数: ${globalCount}`);

    const boundCount = await prisma.shortIdPool.count({
      where: { status: 'BOUND' }
    });
    console.log(`ShortIDPool BOUND 状态记录数: ${boundCount}`);

  } catch (error) {
    console.error('❌ 迁移失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 执行迁移
mergeGlobalShortIdToPool()
  .then(() => {
    console.log('\n🎉 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 脚本执行失败:', error);
    process.exit(1);
  });

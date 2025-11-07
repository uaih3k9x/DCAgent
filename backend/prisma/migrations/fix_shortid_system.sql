-- ============================================
-- 修复 ShortID 系统：统一使用全局分配
-- ============================================

-- 步骤 1: 清理现有的 shortId，准备重新分配
-- 注意：这会删除现有数据，仅用于测试环境

-- 先清空各表的 shortId（避免唯一约束冲突）
UPDATE "Room" SET "shortId" = NULL WHERE "shortId" IS NOT NULL;
UPDATE "Cabinet" SET "shortId" = NULL WHERE "shortId" IS NOT NULL;
UPDATE "Panel" SET "shortId" = NULL WHERE "shortId" IS NOT NULL;

-- 清空 GlobalShortIdAllocation 表（重新开始）
DELETE FROM "GlobalShortIdAllocation";

-- 清空 GlobalShortIdSequence 表
DELETE FROM "GlobalShortIdSequence";

-- 初始化全局序列（从 1 开始）
INSERT INTO "GlobalShortIdSequence" (id, "currentValue", "updatedAt")
VALUES (gen_random_uuid(), 1, NOW());

-- 步骤 2: 为现有实体重新分配全局唯一的 shortID

-- 为机房分配 shortID
DO $$
DECLARE
  room_record RECORD;
  next_shortid INT;
BEGIN
  FOR room_record IN SELECT id FROM "Room" ORDER BY "createdAt"
  LOOP
    -- 获取下一个 shortID
    SELECT "currentValue" INTO next_shortid FROM "GlobalShortIdSequence" LIMIT 1;

    -- 更新机房的 shortId
    UPDATE "Room" SET "shortId" = next_shortid WHERE id = room_record.id;

    -- 记录到全局分配表
    INSERT INTO "GlobalShortIdAllocation" (id, "shortId", "entityType", "entityId", "createdAt")
    VALUES (gen_random_uuid(), next_shortid, 'Room', room_record.id, NOW());

    -- 自增全局序列
    UPDATE "GlobalShortIdSequence" SET "currentValue" = "currentValue" + 1, "updatedAt" = NOW();
  END LOOP;
END $$;

-- 为机柜分配 shortID
DO $$
DECLARE
  cabinet_record RECORD;
  next_shortid INT;
BEGIN
  FOR cabinet_record IN SELECT id FROM "Cabinet" ORDER BY "createdAt"
  LOOP
    SELECT "currentValue" INTO next_shortid FROM "GlobalShortIdSequence" LIMIT 1;
    UPDATE "Cabinet" SET "shortId" = next_shortid WHERE id = cabinet_record.id;
    INSERT INTO "GlobalShortIdAllocation" (id, "shortId", "entityType", "entityId", "createdAt")
    VALUES (gen_random_uuid(), next_shortid, 'Cabinet', cabinet_record.id, NOW());
    UPDATE "GlobalShortIdSequence" SET "currentValue" = "currentValue" + 1, "updatedAt" = NOW();
  END LOOP;
END $$;

-- 为面板分配 shortID（允许 NULL）
DO $$
DECLARE
  panel_record RECORD;
  next_shortid INT;
BEGIN
  FOR panel_record IN SELECT id FROM "Panel" WHERE "shortId" IS NOT NULL ORDER BY "createdAt"
  LOOP
    SELECT "currentValue" INTO next_shortid FROM "GlobalShortIdSequence" LIMIT 1;
    UPDATE "Panel" SET "shortId" = next_shortid WHERE id = panel_record.id;
    INSERT INTO "GlobalShortIdAllocation" (id, "shortId", "entityType", "entityId", "createdAt")
    VALUES (gen_random_uuid(), next_shortid, 'Panel', panel_record.id, NOW());
    UPDATE "GlobalShortIdSequence" SET "currentValue" = "currentValue" + 1, "updatedAt" = NOW();
  END LOOP;
END $$;

-- 步骤 3: 端口的 shortId 字段已经被 Prisma 迁移删除，跳过

-- 步骤 4: 清理旧的 CableShortIdPool（如果需要）
-- DELETE FROM "CableShortIdPool"; -- 如果确定不需要了，可以执行

-- 完成！输出当前状态
SELECT
  'Migration completed!' as status,
  "currentValue" as next_shortid
FROM "GlobalShortIdSequence";

SELECT
  "entityType",
  COUNT(*) as count,
  MIN("shortId") as min_shortid,
  MAX("shortId") as max_shortid
FROM "GlobalShortIdAllocation"
GROUP BY "entityType"
ORDER BY "entityType";

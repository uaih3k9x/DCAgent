-- AlterTable ShortIdPool: 将 entityType 改为可选，并移动到绑定信息部分
ALTER TABLE "ShortIdPool" ALTER COLUMN "entityType" DROP NOT NULL;

-- AlterTable PrintTask: 删除 entityType 列
ALTER TABLE "PrintTask" DROP COLUMN "entityType";

-- 创建新的索引
CREATE INDEX "ShortIdPool_status_idx" ON "ShortIdPool"("status");

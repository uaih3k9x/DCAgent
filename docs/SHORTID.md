# ShortID 管理系统

## 目录

- [ShortID 管理系统](#shortid-管理系统)
  - [目录](#目录)
  - [1. 概述](#1-概述)
  - [2. ShortID 格式规范](#2-shortid-格式规范)
    - [2.1 格式定义](#21-格式定义)
    - [2.2 格式化工具](#22-格式化工具)
  - [3. 三合一系统架构](#3-三合一系统架构)
    - [3.1 GlobalShortIdAllocation（全局分配表）](#31-globalshortidallocation全局分配表)
    - [3.2 ShortIdPool（标签池）](#32-shortidpool标签池)
    - [3.3 PrintTask（打印任务）](#33-printtask打印任务)
    - [3.4 三表关系图](#34-三表关系图)
  - [4. 分配原则](#4-分配原则)
    - [4.1 实体分类](#41-实体分类)
    - [4.2 分配时机](#42-分配时机)
  - [5. 分配流程](#5-分配流程)
    - [5.1 自动分配流程](#51-自动分配流程)
    - [5.2 手动指定流程](#52-手动指定流程)
    - [5.3 预生成流程](#53-预生成流程)
  - [6. 标签打印工作流程](#6-标签打印工作流程)
    - [6.1 创建打印任务](#61-创建打印任务)
    - [6.2 导出标签数据](#62-导出标签数据)
    - [6.3 完成打印任务](#63-完成打印任务)
  - [7. 状态流转](#7-状态流转)
    - [7.1 状态定义](#71-状态定义)
    - [7.2 状态转换规则](#72-状态转换规则)
  - [8. API 使用示例](#8-api-使用示例)
    - [8.1 批量生成ShortID](#81-批量生成shortid)
    - [8.2 创建打印任务](#82-创建打印任务)
    - [8.3 分配ShortID给实体](#83-分配shortid给实体)
    - [8.4 检查ShortID可用性](#84-检查shortid可用性)
    - [8.5 释放ShortID](#85-释放shortid)
    - [8.6 查询池统计信息](#86-查询池统计信息)
    - [8.7 查询打印任务](#87-查询打印任务)
  - [9. 业务场景示例](#9-业务场景示例)
    - [9.1 场景1：预打印标签](#91-场景1预打印标签)
    - [9.2 场景2：创建机柜](#92-场景2创建机柜)
    - [9.3 场景3：线缆手动入库](#93-场景3线缆手动入库)
    - [9.4 场景4：线缆单端连接](#94-场景4线缆单端连接)
  - [10. 最佳实践](#10-最佳实践)
    - [10.1 提前预生成标签](#101-提前预生成标签)
    - [10.2 批次管理](#102-批次管理)
    - [10.3 释放与重用](#103-释放与重用)
    - [10.4 避免冲突](#104-避免冲突)
  - [11. 常见问题](#11-常见问题)
    - [Q1: ShortID为什么要全局唯一？](#q1-shortid为什么要全局唯一)
    - [Q2: 为什么要分GENERATED和PRINTED两个状态？](#q2-为什么要分generated和printed两个状态)
    - [Q3: 删除实体后ShortID会被回收吗？](#q3-删除实体后shortid会被回收吗)
    - [Q4: 手动指定的ShortID会冲突吗？](#q4-手动指定的shortid会冲突吗)
    - [Q5: 如何查看某个ShortID的使用情况？](#q5-如何查看某个shortid的使用情况)

---

## 1. 概述

ShortID管理系统是数据中心资产管理系统的核心组件，用于为实体（机柜、面板、线缆端点等）分配全局唯一的短编号。该系统采用"三合一"架构，将全局分配、标签池管理、打印任务管理整合为统一的工作流。

**核心特性：**
- 全局唯一性：整个系统中的ShortID不会重复
- 格式统一：E-XXXXX格式，便于人工识别和扫码
- 状态追踪：从生成、打印、绑定到报废的全生命周期管理
- 灵活分配：支持自动分配、手动指定、预生成三种模式
- 可重用性：删除实体后ShortID可重新进入池中循环使用

---

## 2. ShortID 格式规范

### 2.1 格式定义

**显示格式：** \`E-XXXXX\`

- **前缀：** \`E-\` 代表 Entity（实体）
- **数字部分：** 最少5位数字，不足补0
- **示例：**
  - \`E-00001\` → 数据库存储为 \`1\`
  - \`E-00123\` → 数据库存储为 \`123\`
  - \`E-12345\` → 数据库存储为 \`12345\`
  - \`E-123456\` → 数据库存储为 \`123456\`（超过5位正常显示）

**数据库存储：** 纯数字（整型）

- 存储为 \`1\`, \`123\`, \`12345\`, \`123456\`
- 节省存储空间，便于索引和查询
- 保证全局唯一性约束

### 2.2 格式化工具

前后端都提供了统一的格式化工具类：

**前端（TypeScript）：**

\`\`\`typescript
import { ShortIdFormatter } from '@/utils/shortIdFormatter';

// 数字 → 显示格式
ShortIdFormatter.toDisplayFormat(1);        // "E-00001"
ShortIdFormatter.toDisplayFormat(12345);    // "E-12345"
ShortIdFormatter.toDisplayFormat(123456);   // "E-123456"

// 显示格式 → 数字
ShortIdFormatter.toNumericFormat("E-00001");  // 1
ShortIdFormatter.toNumericFormat("E-12345");  // 12345
ShortIdFormatter.toNumericFormat("00001");    // 1 (自动去前缀)

// 验证格式
ShortIdFormatter.isValidDisplayFormat("E-00001"); // true
ShortIdFormatter.isValidDisplayFormat("00001");   // false

// 批量转换
ShortIdFormatter.batchToDisplayFormat([1, 2, 3]);
// ["E-00001", "E-00002", "E-00003"]
\`\`\`

**后端（TypeScript）：**

\`\`\`typescript
import { ShortIdFormatter } from '../utils/shortIdFormatter';

// 用法与前端完全一致
const displayId = ShortIdFormatter.toDisplayFormat(1);
const numericId = ShortIdFormatter.toNumericFormat("E-00001");
\`\`\`

---

## 3. 三合一系统架构

ShortID管理系统由三个核心表组成，协同工作，形成完整的管理闭环。

### 3.1 GlobalShortIdAllocation（全局分配表）

**作用：** 记录ShortID的全局分配情况，确保唯一性。

**字段说明：**

\`\`\`typescript
model GlobalShortIdAllocation {
  id         String     @id @default(cuid())
  shortId    Int        @unique           // ShortID（全局唯一）
  entityType EntityType                   // 实体类型
  entityId   String                       // 实体ID
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

enum EntityType {
  CABINET         // 机柜
  ROOM            // 机房
  PANEL           // 面板
  CABLE_ENDPOINT  // 线缆端点（插头）
}
\`\`\`

**特点：**
- 唯一索引约束：\`@@unique([shortId])\`
- 只记录已绑定的ShortID
- 删除实体时同步删除记录

### 3.2 ShortIdPool（标签池）

**作用：** 管理ShortID的状态和生命周期，支持打印、绑定、报废等操作。

**字段说明：**

\`\`\`typescript
model ShortIdPool {
  id          String            @id @default(cuid())
  shortId     Int               @unique          // ShortID（全局唯一）
  status      ShortIdPoolStatus @default(GENERATED)
  entityType  EntityType?                        // 绑定的实体类型
  entityId    String?                            // 绑定的实体ID
  batchNo     String?                            // 批次号
  printTaskId String?                            // 关联的打印任务ID
  printedAt   DateTime?                          // 打印时间
  boundAt     DateTime?                          // 绑定时间
  notes       String?                            // 备注
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  printTask   PrintTask?        @relation(fields: [printTaskId], references: [id])
}

enum ShortIdPoolStatus {
  GENERATED   // 已生成（在池中等待使用）
  PRINTED     // 已打印（标签已打印，等待贴到实体上）
  BOUND       // 已绑定（已分配给实体）
  CANCELLED   // 已报废（标签损坏或作废）
}
\`\`\`

**特点：**
- 记录所有ShortID（包括未绑定的）
- 状态机管理：GENERATED → PRINTED → BOUND → CANCELLED
- 支持批次管理和打印任务关联
- 删除实体时状态重置为GENERATED，可重用

### 3.3 PrintTask（打印任务）

**作用：** 管理标签打印任务，关联多个ShortID。

**字段说明：**

\`\`\`typescript
model PrintTask {
  id          String    @id @default(cuid())
  name        String                      // 任务名称
  count       Int                         // 打印数量
  status      String    @default("PENDING") // 任务状态：PENDING, COMPLETED
  filePath    String?                     // 导出文件路径（CSV/Excel）
  createdBy   String?                     // 创建人
  notes       String?                     // 备注
  createdAt   DateTime  @default(now())
  completedAt DateTime?                   // 完成时间

  shortIds    ShortIdPool[] @relation     // 关联的ShortID列表
}
\`\`\`

**特点：**
- 一个打印任务包含多个ShortID
- 支持导出CSV/Excel用于打印
- 记录创建人、完成时间等审计信息

### 3.4 三表关系图

\`\`\`
GlobalShortIdAllocation (全局分配)
        ↑
        │ 绑定时同步
        │
ShortIdPool (标签池) ←→ PrintTask (打印任务)
        ↓                    1:N
    状态管理
\`\`\`

**工作流程：**

1. **生成阶段：** 在\`ShortIdPool\`中创建记录，状态为\`GENERATED\`
2. **打印阶段：** 创建\`PrintTask\`，将ShortID状态更新为\`PRINTED\`
3. **绑定阶段：** 分配ShortID给实体，同步创建\`GlobalShortIdAllocation\`记录，状态更新为\`BOUND\`
4. **释放阶段：** 删除实体时，删除\`GlobalShortIdAllocation\`记录，\`ShortIdPool\`状态重置为\`GENERATED\`

---

## 4. 分配原则

### 4.1 实体分类

**需要ShortID的实体：**

| 实体类型 | 是否需要ShortID | 说明 |
|---------|----------------|------|
| 机柜 (Cabinet) | ✅ 是 | 需要物理标签标识 |
| 面板 (Panel) | ✅ 是 | 需要扫码快速定位 |
| 线缆端点 (CableEndpoint) | ✅ 是 | 每根线缆两端各有一个插头标签 |
| 机房 (Room) | ❌ 否 | 通常用名称标识，不需要ShortID |
| 设备 (Device) | ❌ 否 | 使用SN序列号，不需要ShortID |
| 端口 (Port) | ❌ 否 | 通过面板和端口号定位 |

**为什么线缆端点需要ShortID？**

- 线缆本身没有独立的ShortID
- 每根线缆有两个端点（A端、B端），每个端点有一个插头
- 每个插头贴一个ShortID标签
- 通过扫描插头标签，可以快速识别线缆和连接关系

### 4.2 分配时机

**创建时自动分配：**
- 机柜：创建时自动分配ShortID
- 面板：创建时自动分配ShortID

**使用时分配：**
- 线缆端点：
  - 手动入库时，扫描两个已打印的标签（shortIdA、shortIdB）
  - 单端连接时，扫描一个已打印的标签（shortId）
  - 双端连接时，扫描两个已打印的标签（shortIdA、shortIdB）

---

## 5. 分配流程

### 5.1 自动分配流程

当创建实体时，如果不指定ShortID，系统会自动分配。

**流程图：**

\`\`\`
1. 创建实体（如机柜）
   ↓
2. 查找池中GENERATED或PRINTED状态的ShortID
   ↓
   有可用ShortID?
   ├─ 是 → 3. 使用该ShortID
   │       ↓
   │       4. 更新ShortIdPool状态为BOUND
   │       ↓
   │       5. 创建GlobalShortIdAllocation记录
   │       ↓
   │       6. 分配完成
   │
   └─ 否 → 3. 查询所有表中最大shortId
           ↓
           4. 生成新ShortID = max + 1
           ↓
           5. 创建ShortIdPool记录（GENERATED）
           ↓
           6. 更新状态为BOUND
           ↓
           7. 创建GlobalShortIdAllocation记录
           ↓
           8. 分配完成
\`\`\`

**代码示例：**

\`\`\`typescript
// 自动分配（从池中取或生成新的）
const shortId = await shortIdPoolService.allocateShortId(
  'CABINET',   // entityType
  cabinetId    // entityId
  // 不传第三个参数，表示自动分配
);

console.log(shortId); // 1 或 12345
\`\`\`

### 5.2 手动指定流程

当创建实体时，可以手动指定一个ShortID。

**流程图：**

\`\`\`
1. 创建实体并指定ShortID
   ↓
2. 检查ShortIdPool中是否存在该ShortID
   ↓
   存在?
   ├─ 是 → 检查状态
   │       ├─ BOUND → 报错：已被占用
   │       ├─ CANCELLED → 报错：已报废
   │       └─ GENERATED/PRINTED → 3. 继续分配
   │
   └─ 否 → 3. 创建新ShortIdPool记录（GENERATED）
           ↓
4. 更新ShortIdPool状态为BOUND
   ↓
5. 创建GlobalShortIdAllocation记录
   ↓
6. 分配完成
\`\`\`

**代码示例：**

\`\`\`typescript
// 手动指定ShortID
const shortId = await shortIdPoolService.allocateShortId(
  'CABINET',   // entityType
  cabinetId,   // entityId
  12345        // 指定的shortId
);

console.log(shortId); // 12345
\`\`\`

### 5.3 预生成流程

为了支持提前打印标签，系统支持批量预生成ShortID。

**流程图：**

\`\`\`
1. 批量生成ShortID
   ↓
2. 查询所有表中最大shortId
   ↓
3. 从max+1开始，生成count个连续的ShortID
   ↓
4. 批量插入ShortIdPool（状态：GENERATED）
   ↓
5. 返回生成的ShortID列表
   ↓
6. （可选）创建打印任务，将状态更新为PRINTED
\`\`\`

**代码示例：**

\`\`\`typescript
// 批量生成100个ShortID
const shortIds = await shortIdPoolService.generateShortIds(
  100,                  // count
  'batch_2025_01_10'    // 批次号（可选）
);

console.log(shortIds); // [1, 2, 3, ..., 100]
\`\`\`

---

## 6. 标签打印工作流程

### 6.1 创建打印任务

创建打印任务时，系统会自动生成指定数量的ShortID，并将状态标记为\`PRINTED\`。

**代码示例：**

\`\`\`typescript
const result = await shortIdPoolService.createPrintTask(
  '机柜标签打印-202501',  // 任务名称
  50,                     // 打印数量
  'admin',                // 创建人
  '用于新机房标签'         // 备注
);

console.log(result);
// {
//   printTask: {
//     id: 'task123',
//     name: '机柜标签打印-202501',
//     count: 50,
//     status: 'PENDING',
//     ...
//   },
//   shortIds: [1, 2, 3, ..., 50]
// }
\`\`\`

### 6.2 导出标签数据

获取打印任务的ShortID列表，用于导出CSV/Excel。

**代码示例：**

\`\`\`typescript
const { task, shortIds } = await shortIdPoolService.getPrintTaskShortIds('task123');

console.log(shortIds); // [1, 2, 3, ..., 50]

// 格式化为显示格式
const displayIds = ShortIdFormatter.batchToDisplayFormat(shortIds);
console.log(displayIds); // ["E-00001", "E-00002", ..., "E-00050"]

// 导出为CSV
const csv = displayIds.map(id => \`\${id}\`).join('\\n');
// E-00001
// E-00002
// ...
// E-00050
\`\`\`

### 6.3 完成打印任务

标签打印完成后，标记任务为完成状态。

**代码示例：**

\`\`\`typescript
await shortIdPoolService.completePrintTask(
  'task123',                      // taskId
  '/exports/labels_202501.csv'    // 文件路径（可选）
);
\`\`\`

---

## 7. 状态流转

### 7.1 状态定义

| 状态 | 说明 | 可转换为 |
|------|------|---------|
| **GENERATED** | 已生成，在池中等待使用 | PRINTED, BOUND, CANCELLED |
| **PRINTED** | 已打印，标签已物理打印 | BOUND, CANCELLED |
| **BOUND** | 已绑定，已分配给实体 | CANCELLED（报废）, GENERATED（释放） |
| **CANCELLED** | 已报废，标签损坏或作废 | 不可转换（终态） |

### 7.2 状态转换规则

**正常流程：**

\`\`\`
GENERATED → PRINTED → BOUND
\`\`\`

**快速绑定（跳过打印）：**

\`\`\`
GENERATED → BOUND
\`\`\`

**释放重用：**

\`\`\`
BOUND → GENERATED
\`\`\`

**报废：**

\`\`\`
任意状态 → CANCELLED
\`\`\`

---

## 8. API 使用示例

### 8.1 批量生成ShortID

\`\`\`typescript
import { shortIdPoolService } from './services/shortIdPoolService';

// 批量生成
const shortIds = await shortIdPoolService.generateShortIds(
  100,                     // 生成数量
  'batch_2025_01_10'       // 批次号（可选）
);

console.log(shortIds); // [1, 2, 3, ..., 100]
\`\`\`

### 8.2 创建打印任务

\`\`\`typescript
// 创建打印任务
const result = await shortIdPoolService.createPrintTask(
  '机柜标签打印',
  50,
  'admin',
  '备注信息'
);

// 获取打印任务的ShortID列表
const { task, shortIds } = await shortIdPoolService.getPrintTaskShortIds(
  result.printTask.id
);

// 导出为显示格式（用于打印）
const displayIds = ShortIdFormatter.batchToDisplayFormat(shortIds);

// 标记任务完成
await shortIdPoolService.completePrintTask(
  result.printTask.id,
  '/path/to/export.csv'
);
\`\`\`

### 8.3 分配ShortID给实体

\`\`\`typescript
// 自动分配
const shortId1 = await shortIdPoolService.allocateShortId(
  'CABINET',   // entityType
  cabinetId    // entityId
);

// 手动指定
const shortId2 = await shortIdPoolService.allocateShortId(
  'PANEL',
  panelId,
  12345        // 指定的shortId
);
\`\`\`

### 8.4 检查ShortID可用性

\`\`\`typescript
const result = await shortIdPoolService.checkShortIdExists(12345);

console.log(result);
// {
//   exists: true,
//   usedBy: 'pool',          // 'pool' 或 'entity'
//   entityType: 'CABINET',   // 如果已绑定
//   details: { ... }
// }
\`\`\`

### 8.5 释放ShortID

\`\`\`typescript
// 删除实体时释放ShortID
await shortIdPoolService.releaseShortId(12345);

// 释放后：
// - GlobalShortIdAllocation记录被删除
// - ShortIdPool状态重置为GENERATED
// - 可被重新分配
\`\`\`

### 8.6 查询池统计信息

\`\`\`typescript
const stats = await shortIdPoolService.getPoolStats();

console.log(stats);
// {
//   total: 150,
//   generated: 20,
//   printed: 50,
//   bound: 70,
//   cancelled: 10,
//   byType: {
//     CABINET: 30,
//     PANEL: 40,
//     CABLE_ENDPOINT: 80
//   }
// }

// 按类型统计
const cabinetStats = await shortIdPoolService.getPoolStats('CABINET');
\`\`\`

### 8.7 查询打印任务

\`\`\`typescript
const { records, total } = await shortIdPoolService.getPrintTasks({
  page: 1,
  pageSize: 20,
  status: 'PENDING'
});

console.log(records);
// [
//   {
//     id: 'task1',
//     name: '机柜标签打印',
//     count: 50,
//     status: 'PENDING',
//     _count: { shortIds: 50 },
//     ...
//   }
// ]
\`\`\`

---

## 9. 业务场景示例

### 9.1 场景1：预打印标签

**需求：** 新机房上线前，提前打印100个机柜标签。

\`\`\`typescript
// 1. 创建打印任务
const { printTask, shortIds } = await shortIdPoolService.createPrintTask(
  '新机房标签打印-2025Q1',
  100,
  'admin'
);

// 2. 导出标签数据
const displayIds = ShortIdFormatter.batchToDisplayFormat(shortIds);

// 3. 生成CSV文件
const csv = displayIds.join('\\n');
fs.writeFileSync('labels.csv', csv);

// 4. 标记任务完成
await shortIdPoolService.completePrintTask(
  printTask.id,
  '/exports/labels.csv'
);

// 现在这100个ShortID在池中，状态为PRINTED，等待被分配
\`\`\`

### 9.2 场景2：创建机柜

**需求：** 创建机柜时，自动分配ShortID。

\`\`\`typescript
// 创建机柜（自动分配ShortID）
const cabinet = await prisma.cabinet.create({
  data: {
    name: 'Cabinet-A01',
    roomId: 'room123',
    position: 'A01',
  }
});

// 自动分配ShortID（从池中取PRINTED状态的，或生成新的）
const shortId = await shortIdPoolService.allocateShortId(
  'CABINET',
  cabinet.id
);

// 更新机柜记录
await prisma.cabinet.update({
  where: { id: cabinet.id },
  data: { shortId }
});

console.log(\`机柜 \${cabinet.name} 分配ShortID: \${ShortIdFormatter.toDisplayFormat(shortId)}\`);
// 机柜 Cabinet-A01 分配ShortID: E-00001
\`\`\`

### 9.3 场景3：线缆手动入库

**需求：** 扫描线缆两端标签，创建线缆记录。

\`\`\`typescript
// 用户扫描两个标签：E-00010 和 E-00011
const shortIdA = ShortIdFormatter.toNumericFormat("E-00010"); // 10
const shortIdB = ShortIdFormatter.toNumericFormat("E-00011"); // 11

// 手动入库
const cable = await cableService.manualInventoryCable({
  shortIdA: shortIdA,
  shortIdB: shortIdB,
  type: 'FIBER_MM',
  length: 10,
  color: 'yellow',
  notes: '多模光纤'
});

// 系统会：
// 1. 检查两个ShortID是否可用
// 2. 创建Cable记录
// 3. 创建两个CableEndpoint记录
// 4. 绑定ShortID到端点
// 5. 更新ShortIdPool状态为BOUND
\`\`\`

### 9.4 场景4：线缆单端连接

**需求：** 扫描插头标签，连接到端口。

\`\`\`typescript
// 用户扫描标签：E-00010
const shortId = ShortIdFormatter.toNumericFormat("E-00010"); // 10

// 单端连接
const result = await cableService.connectSinglePort({
  portId: 'port123',
  shortId: shortId,
  type: 'FIBER_MM',
  length: 5
});

console.log(result);
// {
//   cable: { id: 'cable1', type: 'FIBER_MM', ... },
//   connectedEndpoint: { id: 'endpoint1', shortId: 10, portId: 'port123' },
//   otherEndpoint: null,  // 另一端未连接
//   peerInfo: null
// }
\`\`\`

---

## 10. 最佳实践

### 10.1 提前预生成标签

**建议：** 在实施项目前，批量生成ShortID并打印标签。

\`\`\`typescript
// 生成500个标签
await shortIdPoolService.createPrintTask(
  '项目初始化标签',
  500,
  'admin'
);
\`\`\`

**优点：**
- 标签提前准备好，现场直接贴
- 避免现场打印设备故障
- 减少实施时间

### 10.2 批次管理

**建议：** 使用批次号管理不同批次的标签。

\`\`\`typescript
// 按批次生成
await shortIdPoolService.generateShortIds(100, 'batch_2025_Q1');
await shortIdPoolService.generateShortIds(100, 'batch_2025_Q2');

// 查询时可按批次过滤
const records = await shortIdPoolService.getPoolRecords({
  batchNo: 'batch_2025_Q1'
});
\`\`\`

### 10.3 释放与重用

**建议：** 删除实体时释放ShortID，让其重新进入池中。

\`\`\`typescript
// 删除机柜时释放ShortID
const cabinet = await prisma.cabinet.findUnique({
  where: { id: cabinetId },
  select: { shortId: true }
});

// 先删除实体
await prisma.cabinet.delete({ where: { id: cabinetId } });

// 再释放ShortID
if (cabinet?.shortId) {
  await shortIdPoolService.releaseShortId(cabinet.shortId);
}

// 现在这个ShortID可以被重新分配
\`\`\`

### 10.4 避免冲突

**建议：** 在分配前检查ShortID可用性。

\`\`\`typescript
// 手动指定前先检查
const check = await shortIdPoolService.checkShortIdExists(12345);

if (check.exists && check.usedBy !== 'pool') {
  throw new Error(\`ShortID \${12345} 已被占用\`);
}

// 再分配
await shortIdPoolService.allocateShortId('CABINET', cabinetId, 12345);
\`\`\`

---

## 11. 常见问题

### Q1: ShortID为什么要全局唯一？

**答：**
- 扫码跳转需要全局唯一性，避免扫到同一个ShortID不知道跳转到哪里
- 简化查询逻辑，一个ShortID对应唯一实体
- 支持未来扩展更多实体类型

### Q2: 为什么要分GENERATED和PRINTED两个状态？

**答：**
- **GENERATED：** 在系统中生成，但未打印标签
- **PRINTED：** 标签已物理打印，可以贴到实体上
- 区分这两种状态，方便追踪标签打印进度和库存

### Q3: 删除实体后ShortID会被回收吗？

**答：**
- 会回收！删除实体时调用 \`releaseShortId()\`
- ShortIdPool状态重置为GENERATED
- GlobalShortIdAllocation记录被删除
- 可以重新分配给其他实体

### Q4: 手动指定的ShortID会冲突吗？

**答：**
- 系统会自动检查ShortID是否可用
- 如果已被占用（BOUND状态），会报错
- 如果在池中（GENERATED/PRINTED状态），可以正常分配
- 如果不存在，会自动创建池记录

### Q5: 如何查看某个ShortID的使用情况？

**答：**

\`\`\`typescript
const check = await shortIdPoolService.checkShortIdExists(12345);

console.log(check);
// {
//   exists: true,
//   usedBy: 'entity',
//   entityType: 'CABINET',
//   details: {
//     id: 'cabinet123',
//     name: 'Cabinet-A01',
//     ...
//   }
// }
\`\`\`

---

## 相关文档

- [线缆管理系统](./CABLE_MANAGEMENT.md)
- [光模块管理系统](./OPTICAL_MODULE.md)
- [前端架构](./FRONTEND.md)

# DCAgent 数据库设计

## 目录
- [数据库技术选型](#数据库技术选型)
- [实体关系图](#实体关系图)
- [核心数据模型](#核心数据模型)
- [ShortID 管理系统](#shortid-管理系统)
- [线缆管理系统](#线缆管理系统)
- [光模块管理系统](#光模块管理系统)
- [面板模板系统](#面板模板系统)
- [枚举类型](#枚举类型)
- [索引设计](#索引设计)

## 数据库技术选型

### PostgreSQL（主数据库）

**选择理由：**
- 成熟的 ACID 事务支持
- 强大的 JSON 字段支持（面板布局配置）
- 丰富的数据类型（UUID、DateTime、Enum）
- 级联删除和外键约束
- Prisma ORM 优秀的支持

**配置：**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dcagent"
```

### Neo4j（辅助图数据库）

**选择理由：**
- 专门为图关系设计
- 高效的多跳查询
- 可视化拓扑图数据
- Cypher 查询语言简洁

**配置：**
```env
NEO4J_URI="bolt://localhost:7687"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="password"
```

## 实体关系图

### 层级结构

```
DataCenter（数据中心）
    ↓ 1:N
  Room（机房）
    ↓ 1:N
 Cabinet（机柜）
    ↓ 1:N
  Device（设备）
    ↓ 1:N
  Panel（面板）
    ↓ 1:N
   Port（端口）
```

### 线缆连接关系

```
Port A ←→ CableEndpoint A ←→ Cable ←→ CableEndpoint B ←→ Port B

支持分支线缆（1对多）：
Port A (QSFP) ←→ CableEndpoint A ←→ Cable ←→ CableEndpoint B1 ←→ Port B1 (SFP)
                                         ↓→ CableEndpoint B2 ←→ Port B2 (SFP)
                                         ↓→ CableEndpoint B3 ←→ Port B3 (SFP)
                                         ↓→ CableEndpoint B4 ←→ Port B4 (SFP)
```

### ShortID 分配关系

```
GlobalShortIdSequence (单行表，当前值)
         ↓
GlobalShortIdAllocation (分配记录)
         ↓
    实体表 (Room, Cabinet, Panel, CableEndpoint)
         ↓
  ShortIdPool (标签池，用于打印)
         ↓
   PrintTask (打印任务)
```

## 核心数据模型

### DataCenter（数据中心）

**用途：** 最顶层的地理位置划分，作为入口选择页面

```prisma
model DataCenter {
  id        String   @id @default(uuid())
  name      String
  location  String?
  rooms     Room[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**设计说明：**
- 无 shortID（作为入口选择，不需要快速访问）
- 级联删除：删除数据中心会删除所有机房

### Room（机房）

**用途：** 数据中心内的独立机房

```prisma
model Room {
  id           String     @id @default(uuid())
  shortId      Int?       @unique
  name         String
  floor        String?
  dataCenterId String
  dataCenter   DataCenter @relation(...)
  cabinets     Cabinet[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}
```

**设计说明：**
- 有 shortID（用于快速识别机房）
- 通过 GlobalShortIdAllocation 统一分配
- 级联删除：删除机房会删除所有机柜

### Cabinet（机柜）

**用途：** 机房内的机柜，标准为 42U

```prisma
model Cabinet {
  id        String   @id @default(uuid())
  shortId   Int?     @unique
  name      String
  position  String?  // 机房中的位置（如 A01）
  height    Int      @default(42) // U数
  roomId    String
  room      Room     @relation(...)
  devices   Device[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**设计说明：**
- 有 shortID（需要贴标签识别）
- 默认高度 42U（可自定义）
- 级联删除：删除机柜会删除所有设备

### Device（设备）

**用途：** 安装在机柜中的设备（服务器、交换机、路由器等）

```prisma
enum DeviceType {
  SERVER
  SWITCH
  ROUTER
  FIREWALL
  STORAGE
  PDU
  OTHER
}

model Device {
  id        String     @id @default(uuid())
  name      String
  type      DeviceType
  model     String?
  serialNo  String?    @unique
  uPosition Int?       // 在机柜中的U位
  uHeight   Int?       // 占用几U
  cabinetId String
  cabinet   Cabinet    @relation(...)
  panels    Panel[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

**设计说明：**
- 无 shortID（可通过机柜位置唯一定位）
- 序列号唯一（用于资产管理）
- U位管理（精确到 U 级别）
- 级联删除：删除设备会删除所有面板

### Panel（面板）

**用途：** 设备上的接口面板

```prisma
enum PanelType {
  NETWORK      // 网络面板
  POWER        // 电源面板
  CONSOLE      // 控制台/串口面板
  USB          // USB面板
  MIXED        // 混合功能面板
  OTHER        // 其他
}

model Panel {
  id              String         @id @default(uuid())
  name            String
  type            PanelType
  shortId         Int?           @unique
  deviceId        String
  device          Device         @relation(...)
  ports           Port[]
  templateId      String?
  template        PanelTemplate? @relation(...)
  isCustomized    Boolean        @default(false)
  position        Json?          // {x, y}
  size            Json?          // {width, height}
  backgroundColor String?
  image           String?
  svgPath         String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}
```

**设计说明：**
- 有 shortID（用于扫码快速定位）
- 支持模板复用（templateId）
- isCustomized：标记是否已从模板解绑
- JSON 字段存储布局信息（灵活配置）
- 级联删除：删除面板会删除所有端口

### Port（端口）

**用途：** 面板上的物理端口

```prisma
enum PortStatus {
  AVAILABLE  // 可用
  OCCUPIED   // 占用
  RESERVED   // 预留
  FAULTY     // 故障
}

enum PhysicalStatus {
  EMPTY         // 空槽位
  MODULE_ONLY   // 已安装模块但未连线
  CONNECTED     // 已连接线缆
}

model Port {
  id             String          @id @default(uuid())
  number         String
  label          String?
  status         PortStatus      @default(AVAILABLE)
  physicalStatus PhysicalStatus  @default(EMPTY)
  panelId        String
  panel          Panel           @relation(...)
  portType       String?         // RJ45, SFP, QSFP等
  rotation       Float?          @default(0)
  position       Json?           // {x, y}
  size           Json?           // {width, height}
  cableEndpoints CableEndpoint[]
  opticalModule  OpticalModule?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  @@unique([panelId, number])
}
```

**设计说明：**
- 无 shortID（端口太小，贴不了标签）
- 双状态管理：
  - `status`：逻辑状态（是否可用）
  - `physicalStatus`：物理状态（是否安装模块、是否连线）
- 支持旋转角度（用于可视化）
- 唯一约束：同一面板上的端口编号不能重复

## ShortID 管理系统

详见 [SHORTID.md](SHORTID.md)，这里简要说明：

### GlobalShortIdSequence（全局序列）

```prisma
model GlobalShortIdSequence {
  id           String   @id @default(uuid())
  currentValue Int      @default(1)
  updatedAt    DateTime @updatedAt
}
```

**用途：** 单行表，记录当前 shortID 的最大值

### GlobalShortIdAllocation（全局分配记录）

```prisma
model GlobalShortIdAllocation {
  id         String   @id @default(uuid())
  shortId    Int      @unique
  entityType String   // ROOM, CABINET, PANEL, CABLE_ENDPOINT
  entityId   String   // 实体的 UUID
  createdAt  DateTime @default(now())

  @@index([entityType])
  @@index([entityId])
}
```

**用途：** 记录所有 shortID 的分配情况，确保全局唯一

### ShortIdPool（标签池）

```prisma
enum ShortIdPoolStatus {
  GENERATED   // 已生成
  PRINTED     // 已打印
  BOUND       // 已绑定
  CANCELLED   // 已报废
}

model ShortIdPool {
  id          String             @id @default(uuid())
  shortId     Int                @unique
  status      ShortIdPoolStatus  @default(GENERATED)
  entityType  EntityType?
  entityId    String?
  boundAt     DateTime?
  printTaskId String?
  printTask   PrintTask?         @relation(...)
  printedAt   DateTime?
  batchNo     String?
  notes       String?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  @@index([entityType, status])
  @@index([shortId])
  @@index([status])
}
```

**用途：** 预先生成 shortID，用于批量打印标签

**状态流转：**
```
GENERATED → PRINTED → BOUND → (CANCELLED)
```

### PrintTask（打印任务）

```prisma
model PrintTask {
  id          String         @id @default(uuid())
  name        String
  count       Int
  status      String         @default("PENDING")
  filePath    String?
  notes       String?
  shortIds    ShortIdPool[]
  createdBy   String?
  createdAt   DateTime       @default(now())
  completedAt DateTime?
  updatedAt   DateTime       @updatedAt
}
```

**用途：** 管理标签打印批次，支持导出 CSV/Excel

## 线缆管理系统

详见 [CABLE_MANAGEMENT.md](CABLE_MANAGEMENT.md)，这里简要说明：

### Cable（线缆）

```prisma
enum CableType {
  CAT5E
  CAT6
  CAT6A
  CAT7
  FIBER_SM       // 单模光纤
  FIBER_MM       // 多模光纤
  QSFP_TO_SFP    // QSFP转SFP分支线缆
  QSFP_TO_QSFP   // QSFP直连
  SFP_TO_SFP     // SFP直连
  POWER
  OTHER
}

enum CableInventoryStatus {
  NOT_INVENTORIED  // 未入库
  INVENTORIED      // 已入库（未连接）
  IN_USE           // 使用中
}

model Cable {
  id              String                @id @default(uuid())
  label           String?
  type            CableType
  length          Float?
  color           String?
  notes           String?
  isBranched      Boolean               @default(false)
  inventoryStatus CableInventoryStatus  @default(NOT_INVENTORIED)
  endpoints       CableEndpoint[]
  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt
}
```

**设计说明：**
- 无 shortID（线缆通过端点 shortID 识别）
- 支持分支线缆（1对多连接）
- 入库状态管理

### CableEndpoint（线缆端点）

```prisma
model CableEndpoint {
  id        String   @id @default(uuid())
  shortId   Int?     @unique
  cableId   String
  cable     Cable    @relation(...)
  portId    String?
  port      Port?    @relation(...)
  endType   String   // "A", "B1", "B2", "B3", "B4"
  createdAt DateTime @default(now())

  @@unique([cableId, endType])
}
```

**设计说明：**
- 有 shortID（每个插头独立标签）
- portId 可为空（支持未连接状态）
- endType 标识端点类型（支持分支）

## 光模块管理系统

详见 [OPTICAL_MODULE.md](OPTICAL_MODULE.md)，这里简要说明：

### OpticalModule（光模块）

```prisma
enum ModuleStatus {
  IN_STOCK      // 在库
  INSTALLED     // 已安装
  RESERVED      // 预留
  FAULTY        // 故障
  SCRAPPED      // 已报废
}

model OpticalModule {
  id             String           @id @default(uuid())
  serialNo       String           @unique
  model          String
  vendor         String
  moduleType     String           // SFP, SFP_PLUS, QSFP, QSFP28
  wavelength     String?
  distance       String?
  ddmSupport     Boolean          @default(false)
  supplier       String?
  purchaseDate   DateTime?
  price          Float?
  warrantyExpiry DateTime?
  status         ModuleStatus     @default(IN_STOCK)
  currentPortId  String?          @unique
  currentPort    Port?            @relation(...)
  movements      ModuleMovement[]
  notes          String?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  @@index([status])
  @@index([moduleType])
  @@index([currentPortId])
}
```

**设计说明：**
- serialNo 作为唯一标识
- currentPortId：当前安装位置（null 表示在库）
- 完整的采购信息和技术参数

### ModuleMovement（移动历史）

```prisma
enum MovementType {
  PURCHASE      // 采购入库
  INSTALL       // 安装到端口
  UNINSTALL     // 从端口卸下
  TRANSFER      // 转移到其他端口
  REPAIR        // 送修
  RETURN        // 维修返回
  SCRAP         // 报废
}

model ModuleMovement {
  id           String        @id @default(uuid())
  moduleId     String
  module       OpticalModule @relation(...)
  movementType MovementType
  fromPortId   String?
  toPortId     String?
  operator     String?
  notes        String?
  createdAt    DateTime      @default(now())

  @@index([moduleId])
  @@index([createdAt])
}
```

**用途：** 完整的审计追踪，记录光模块的所有操作

## 面板模板系统

### PanelTemplate（面板模板）

```prisma
model PanelTemplate {
  id              String    @id @default(uuid())
  name            String
  type            PanelType
  portCount       Int
  description     String?
  width           Float     @default(482.6)
  height          Float     @default(44.45)
  layoutConfig    Json?     // 布局规则
  portDefinitions Json      // 端口定义数组
  backgroundColor String?
  image           String?
  svgPath         String?
  isSystem        Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  panels          Panel[]
}
```

**用途：** 可复用的面板配置，提高效率

**JSON 结构示例：**
```json
{
  "layoutConfig": {
    "portsPerRow": 12,
    "rowSpacing": 10,
    "portSize": {"width": 15, "height": 12},
    "spacing": 5
  },
  "portDefinitions": [
    {
      "number": "1",
      "position": {"x": 10, "y": 10},
      "size": {"width": 15, "height": 12},
      "portType": "RJ45"
    }
  ]
}
```

## 枚举类型

### EntityType（实体类型）

```prisma
enum EntityType {
  DATA_CENTER
  ROOM
  CABINET
  DEVICE
  PANEL
  PORT
  CABLE
  CABLE_ENDPOINT
}
```

**用途：** 标识 shortID 绑定的实体类型

## 索引设计

### 性能优化索引

```prisma
// Port 表
@@unique([panelId, number])  // 快速查找面板端口

// GlobalShortIdAllocation 表
@@index([entityType])         // 按类型查询
@@index([entityId])           // 按实体ID查询

// ShortIdPool 表
@@index([entityType, status]) // 按类型和状态查询
@@index([shortId])            // shortID 查找
@@index([status])             // 状态过滤

// OpticalModule 表
@@index([status])             // 状态过滤
@@index([moduleType])         // 类型统计
@@index([currentPortId])      // 端口反查

// ModuleMovement 表
@@index([moduleId])           // 查询模块历史
@@index([createdAt])          // 时间排序
```

## 级联删除策略

```
DataCenter DELETE → Cascade DELETE Rooms
Room DELETE → Cascade DELETE Cabinets
Cabinet DELETE → Cascade DELETE Devices
Device DELETE → Cascade DELETE Panels
Panel DELETE → Cascade DELETE Ports
Port DELETE → Cascade DELETE CableEndpoints
Cable DELETE → Cascade DELETE CableEndpoints
```

**注意：**
- 删除端口时，连接的线缆端点会被级联删除
- 删除线缆时，所有端点会被级联删除
- 光模块采用 `onDelete: SetNull`，不级联删除

## 数据完整性约束

### 唯一性约束
- `Room.shortId` - UNIQUE
- `Cabinet.shortId` - UNIQUE
- `Panel.shortId` - UNIQUE
- `CableEndpoint.shortId` - UNIQUE
- `Device.serialNo` - UNIQUE
- `OpticalModule.serialNo` - UNIQUE
- `OpticalModule.currentPortId` - UNIQUE（一个端口只能装一个模块）

### 业务规则约束
- 光纤线缆连接端口前，必须先安装光模块
- DAC 直连线缆不需要光模块
- 同一面板上的端口编号不能重复
- shortID 全局唯一，不可重复分配

## 下一步

- [API 完整文档](API.md)
- [ShortID 系统详解](SHORTID.md)
- [线缆管理系统](CABLE_MANAGEMENT.md)
- [光模块管理系统](OPTICAL_MODULE.md)

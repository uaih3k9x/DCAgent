# DCAgent Backend

数据中心线缆管理系统 - 后端服务

## 技术栈

- Node.js + TypeScript
- Express.js
- Prisma ORM (PostgreSQL)
- Neo4j 图数据库
- Zod (数据验证)

## 项目结构

```
backend/
├── src/
│   ├── graph/          # Neo4j 图数据库操作
│   │   ├── neo4j.ts
│   │   └── cableGraph.ts
│   ├── routes/         # API 路由（13个路由模块）
│   │   ├── datacenters.ts
│   │   ├── rooms.ts
│   │   ├── cabinets.ts
│   │   ├── devices.ts
│   │   ├── panels.ts
│   │   ├── ports.ts
│   │   ├── cables.ts
│   │   ├── opticalModules.ts
│   │   ├── panelTemplateRoutes.ts
│   │   ├── shortIdPool.ts
│   │   ├── cableShortIdPool.ts (向后兼容)
│   │   ├── search.ts
│   │   └── monitoring.ts (已隐藏)
│   ├── services/       # 业务逻辑层
│   │   ├── dataCenterService.ts
│   │   ├── roomService.ts
│   │   ├── cabinetService.ts
│   │   ├── deviceService.ts
│   │   ├── panelService.ts
│   │   ├── portService.ts
│   │   ├── cableService.ts
│   │   ├── opticalModuleService.ts
│   │   ├── shortIdService.ts
│   │   └── ...
│   ├── utils/          # 工具函数
│   │   └── prisma.ts
│   └── index.ts        # 入口文件
├── prisma/
│   └── schema.prisma   # 数据库 Schema
└── package.json
```

## 数据模型

### 关系数据库 (Prisma + PostgreSQL)
- **DataCenter** - 数据中心
- **Room** - 机房（带 ShortID）
- **Cabinet** - 机柜（带 ShortID）
- **Device** - 设备（可在机柜中唯一识别）
- **Panel** - 面板（带 ShortID、支持模板）
- **Port** - 端口（支持多种端口类型）
- **Cable** - 线缆（带双端 ShortID）
- **CableEndpoint** - 线缆端点（关联 ShortID）
- **OpticalModule** - 光模块（带序列号、安装历史）
- **PanelTemplate** - 面板模板（可复用配置）
- **GlobalShortIdAllocation** - ShortID 分配记录

### 图数据库 (Neo4j)
- **Port** 节点 - 端口
- **Panel** 节点 - 面板
- **Cable** 节点 - 线缆
- **CONNECTED_BY** 关系 - 连接关系
- **HAS_PORT** 关系 - 面板拥有端口

## 安装

```bash
# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env

# 编辑 .env 文件，配置数据库连接
# 特别是 Neo4j 的连接信息

# 生成 Prisma Client
npm run prisma:generate

# 运行数据库迁移
npm run prisma:migrate
```

## 开发

```bash
# 启动开发服务器（支持热重载）
npm run dev

# 构建
npm run build

# 运行生产版本
npm start

# 打开 Prisma Studio（数据库可视化工具）
npm run prisma:studio
```

## 环境变量

```env
# 关系数据库 (PostgreSQL)
DATABASE_URL="postgresql://dcagent:dcagent_password@localhost:5432/dcagent?schema=public"

# Neo4j 图数据库
NEO4J_URI="bolt://localhost:7687"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="password"

# 服务器配置
PORT=3000
NODE_ENV=development
```

## API 设计规范

所有 API 统一使用 **POST 方法 + body 传参**（不是传统的 RESTful），基础 URL 为 `/api/v1`

```typescript
// 正确的方式
POST /api/v1/cabinets/get
Content-Type: application/json

{
  "id": "cabinet-uuid"
}

// 不使用的方式
GET /api/v1/cabinets/:id  // ❌ 不拼接 URL
```

详见 [API.md](../docs/API.md) 获取完整的 API 文档

## API 路由模块 (13个)

| 模块 | 前缀 | 说明 |
|------|------|------|
| 数据中心 | `/api/v1/datacenters` | 数据中心管理 |
| 机房 | `/api/v1/rooms` | 机房管理 |
| 机柜 | `/api/v1/cabinets` | 机柜管理（支持 ShortID） |
| 设备 | `/api/v1/devices` | 设备管理 |
| 面板 | `/api/v1/panels` | 面板管理（支持 ShortID、模板） |
| 端口 | `/api/v1/ports` | 端口管理 |
| 线缆 | `/api/v1/cables` | 线缆管理（双端 ShortID）|
| 光模块 | `/api/v1/optical-modules` | 光模块库存和安装管理 |
| 面板模板 | `/api/v1/panel-templates` | 可复用的面板配置 |
| ShortID 池 | `/api/v1/shortid-pool` | ShortID 生成、分配、绑定 |
| 线缆 ShortID 池 | `/api/v1/cable-shortid-pool` | 向后兼容（已废弃） |
| 全局搜索 | `/api/v1/search` | 按关键词或 ShortID 搜索 |
| SNMP 监控 | `/api/v1/monitoring` | 设备监控（已隐藏） |

## 核心功能

### 1. 分层资源管理
- 数据中心 → 机房 → 机柜 → 设备 → 面板 → 端口
- 完整的级联删除支持
- ShortID 快速识别（机柜、机房、面板等）

### 2. 线缆管理
- 线缆两端 ShortID 记录和快速查询
- 端口连接状态跟踪
- 网状拓扑图生成（用于前端可视化）
- 单端连接和双端连接支持
- 手动入库机制

### 3. ShortID 系统
- 统一的 ShortID 分配和管理
- 支持批量生成、打印、绑定
- 格式化显示（E-00001）
- 适用场景：机柜、机房、面板、线缆端点

### 4. 光模块管理
- 库存追踪（购买、入库、在库）
- 安装/卸载历史
- 序列号追踪
- 物理转移和报废管理

### 5. 面板模板
- 预设模板（24口、48口交换机等）
- 快速创建标准化面板
- 自动生成端口配置

### 6. 拓扑查询
- 利用 Neo4j 高效的关系查询
- 多跳网络路径查询
- 快速查找连接关系

## Neo4j 安装

### macOS (使用 Homebrew)
```bash
brew install neo4j
neo4j start
```

### Docker
```bash
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

访问 http://localhost:7474 打开 Neo4j Browser

## 开发注意事项

1. **数据一致性**: 关系数据库和图数据库需要保持同步
2. **端口状态**: 创建线缆时自动更新端口状态为 OCCUPIED
3. **级联删除**: 删除上层对象时会级联删除下层对象
4. **事务处理**: 线缆创建涉及多个操作，需要注意错误处理

## License

MIT

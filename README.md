# DCAgent - 数据中心全生命周期管理系统

<div align="center">

**"見えない線を、見える化へ"**

*将看不见的线，变为可见*

</div>

数据中心线缆跟踪与资产管理系统

## 快速导航

- [快速开始](#快速开始)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [核心概念](#核心概念)
- [文档](#文档)
- [开发路线图](#开发路线图)

## 快速开始

### 使用 Docker Compose（推荐）

```bash
# 启动所有服务
docker-compose up -d

# 访问应用
# 前端: http://localhost:5173
# 后端: http://localhost:3000
# Neo4j: http://localhost:7474
```

### 本地开发

详细步骤请查看 [GETTING_STARTED.md](GETTING_STARTED.md)

```bash
# 1. 启动 Neo4j (使用 Docker)
docker run -d --name neo4j -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password neo4j:5-community

# 2. 启动后端
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev

# 3. 启动前端
cd frontend
npm install
cp .env.example .env
npm run dev
```

访问 http://localhost:5173 即可使用

## 功能特性

### 核心功能

#### 资产管理
- **分层管理**：数据中心 → 机房 → 机柜 → 设备
- **U位详细跟踪**：精确记录每个设备在机柜中的位置
- **设备信息管理**：型号、序列号、配置等完整信息
- **批量上架**：支持 Excel/CSV 批量导入设备

#### 连接管理
- **面板管理**：6种面板类型（网口、光纤、电源、串口、USB等）
- **端口管理**：4种逻辑状态 + 3种物理状态
- **端口批量创建**：快速创建标准面板端口
- **端口到端口连接跟踪**：精确追踪线缆连接关系

#### 可视化
- **线缆拓扑图**：基于 React Flow 的交互式拓扑图
- **快速查找线缆另一端**：扫描 shortID 即可查看对端
- **面板关联网络可视化**：多跳网络拓扑展示
- **支持多种线缆类型**：网线、光纤、电源线、DAC、AOC等
- **节点详情查看与路径高亮**

#### ShortID 系统
- **格式**：E-XXXXX（例如 E-00001）
- **用途**：机柜、面板、线缆端点快速识别
- **三合一设计**：GlobalAllocation + Pool + PrintTask
- **标签打印**：批量生成、打印任务管理、CSV导出
- **扫码导航**：扫描标签快速跳转到对应实体

#### 线缆管理
- **三种入库方式**：
  - 手动入库：扫描两端 shortID 创建线缆记录
  - 单端连接：扫描插头连接到端口
  - 双端连接：同时创建线缆和连接关系
- **支持分支线缆**：1对多连接（如 QSFP 转 4xSFP）
- **兼容性验证**：自动检查线缆类型与端口匹配
- **入库状态管理**：NOT_INVENTORIED → INVENTORIED → IN_USE

#### 光模块管理
- **全生命周期管理**：采购 → 安装 → 转移 → 报废
- **库存管理**：按状态、类型、厂商统计
- **移动历史**：完整的审计追踪
- **DDM 支持**：数字诊断监控标记

#### 面板模板系统
- **可复用配置**：24口、48口交换机等预设模板
- **自动布局生成**：根据端口数量自动计算位置
- **支持混合端口**：同一面板可包含 RJ45、SFP、QSFP 等
- **模板解绑**：支持从模板自定义

### 计划中的功能

- **SNMP/IPMI集成**：设备监控数据采集
- **健康追踪**：设备运行状态监控
- **资产盘点**：完整的资产清单和统计
- **AI优化布局**：智能优化机房布局建议
- **全局仪表板**：一站式纵览整个数据中心

## 技术栈

### 后端
- **Node.js** + **TypeScript**
- **Express.js** - Web 框架
- **Prisma** ORM - 数据库操作
- **PostgreSQL** - 关系数据库
- **Neo4j** - 图数据库（拓扑关系）
- **Zod** - 运行时数据验证

### 前端
- **React 18** + **TypeScript**
- **Vite** - 构建工具
- **Ant Design** - UI 组件库
- **React Flow** - 拓扑图可视化
- **i18next** - 国际化（中/英/日）
- **Axios** - HTTP 客户端

## 项目结构

```
DCAgent/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── routes/       # 13 个 API 路由模块
│   │   ├── services/     # 14 个业务逻辑服务
│   │   ├── graph/        # Neo4j 图数据库操作
│   │   ├── middleware/   # 日志、错误处理
│   │   └── index.ts
│   └── prisma/
│       └── schema.prisma # 数据库模型定义
├── frontend/             # 前端应用
│   ├── src/
│   │   ├── pages/        # 15 个页面
│   │   ├── components/   # 17 个公共组件
│   │   ├── services/     # 14 个 API 服务
│   │   ├── types/        # TypeScript 类型定义
│   │   ├── locales/      # 国际化资源
│   │   └── App.tsx
│   └── public/
├── docs/                 # 详细文档
│   ├── ARCHITECTURE.md   # 架构设计
│   ├── DATABASE.md       # 数据库设计
│   ├── API.md            # API 完整文档
│   ├── SHORTID.md        # ShortID 系统
│   ├── CABLE_MANAGEMENT.md  # 线缆管理
│   ├── OPTICAL_MODULE.md    # 光模块管理
│   └── FRONTEND.md       # 前端架构
├── docker-compose.yml
├── README.md             # 本文件
└── GETTING_STARTED.md    # 快速开始指南
```

## 核心概念

### 层级结构

```
DataCenter（数据中心）
    ↓ 1:N
  Room（机房）有 shortID
    ↓ 1:N
 Cabinet（机柜）有 shortID
    ↓ 1:N
  Device（设备）无 shortID
    ↓ 1:N
  Panel（面板）有 shortID
    ↓ 1:N
   Port（端口）无 shortID
```

### ShortID 分配原则

**有 shortID 的实体**：需要物理标签快速识别
- Room（机房）
- Cabinet（机柜）
- Panel（面板）
- CableEndpoint（线缆端点）

**无 shortID 的实体**：可通过父实体定位
- DataCenter（入口选择页面）
- Device（通过机柜定位）
- Port（太小贴不了标签）

### 双数据库策略

**PostgreSQL**（主数据库）:
- 存储所有业务数据
- ACID 事务保证
- 关系完整性约束

**Neo4j**（辅助图数据库）:
- 存储拓扑关系
- 多跳路径查询
- 网络可视化数据

### API 设计规范

**统一使用 POST + body 传参**：

```typescript
// 正确的方式
POST /api/v1/cabinets/get
{
  "id": "cabinet-uuid"
}

// 不使用的方式
GET /api/v1/cabinets/:id  // ❌
```

所有 API 路由前缀：`/api/v1/`

## 文档

### 完整文档列表

| 文档 | 说明 |
|------|------|
| [GETTING_STARTED.md](GETTING_STARTED.md) | 详细的安装和使用指南 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 整体架构设计和技术选型 |
| [docs/DATABASE.md](docs/DATABASE.md) | 数据库模型详解和设计原则 |
| [docs/API.md](docs/API.md) | 完整的 API 端点文档（13个模块）|
| [docs/SHORTID.md](docs/SHORTID.md) | ShortID 系统设计和使用 |
| [docs/CABLE_MANAGEMENT.md](docs/CABLE_MANAGEMENT.md) | 线缆管理系统详解 |
| [docs/OPTICAL_MODULE.md](docs/OPTICAL_MODULE.md) | 光模块生命周期管理 |
| [docs/FRONTEND.md](docs/FRONTEND.md) | 前端架构和组件说明 |
| [backend/README.md](backend/README.md) | 后端开发文档 |
| [frontend/README.md](frontend/README.md) | 前端开发文档 |

### 文档快速查找

**想了解整体架构？** → [ARCHITECTURE.md](docs/ARCHITECTURE.md)

**需要调用 API？** → [API.md](docs/API.md)

**不懂 shortID 怎么用？** → [SHORTID.md](docs/SHORTID.md)

**想知道线缆如何管理？** → [CABLE_MANAGEMENT.md](docs/CABLE_MANAGEMENT.md)

**需要开发前端功能？** → [FRONTEND.md](docs/FRONTEND.md)

**数据库设计疑问？** → [DATABASE.md](docs/DATABASE.md)

## 使用场景

DCAgent 适用于以下场景：

- **企业数据中心**: 管理数百台服务器和成千上万条线缆
- **SOHO/小型机房**: 简单的设备和线缆跟踪
- **运维团队**: 快速定位故障、规划布线
- **资产管理**: 完整的设备清单和生命周期追踪
- **教学演示**: 理解数据中心基础设施管理

## 主要特色

### 与其他 DCIM 的区别

1. **ShortID 系统**：独创的短 ID 标识方案，支持扫码快速定位
2. **双数据库**：关系数据库 + 图数据库，兼顾业务逻辑和拓扑查询
3. **线缆端点独立**：每个插头独立 shortID，支持单端操作
4. **光模块管理**：完整的光模块生命周期追踪
5. **面板模板**：可复用配置，提高效率
6. **国际化**：支持中英日三语

## 开发路线图

### ✅ Phase 1 - 基础功能 (已完成)
- 数据模型设计
- 设备管理 API
- 线缆跟踪 API
- 图数据库集成
- 基础前端界面

### ✅ Phase 2 - 基础设施管理 (已完成)
- 数据中心/机房/机柜完整管理
- 设备管理 (CRUD + 级联选择)
- 面板管理 (6种类型)
- 端口管理 (批量创建 + 状态管理)
- API 版本化与统一模式

### ✅ Phase 3 - 可视化与批量操作 (已完成)
- 网状拓扑图可视化 (React Flow)
- 面板编辑增强 (旋转 + 端口组)
- 批量上架助手 (Excel/CSV导入)
- 交互式拓扑图操作
- Beta Release V0.1

### ✅ Phase 4 - ShortID 与光模块 (已完成)
- ShortID 三合一系统（Global + Pool + PrintTask）
- 标签打印任务管理
- 光模块全生命周期管理
- 线缆手动入库和单端连接
- 面板模板系统

### Phase 5 - 高级管理功能 (进行中)
- [ ] IP地址管理
- [ ] 电源管理（Phase、UPS）
- [ ] U位可视化增强
- [ ] 仪表板数据统计

### Phase 6 - 监控与智能化 (计划中)
- [ ] SNMP集成
- [ ] IPMI监控
- [ ] 实时健康监控
- [ ] 资产盘点功能
- [ ] 报表生成

### Phase 7 - AI 智能化 (未来)
- [ ] AI布局优化
- [ ] 预测性维护
- [ ] 能耗优化建议
- [ ] 自动化运维建议

## 项目愿景

DCAgent 的目标是成为一个**全功能的数据中心基础设施管理系统（DCIM）**，帮助从小型 SOHO 机房到大型企业数据中心的各类用户，实现：

1. **可视化管理**: 将复杂的线缆和设备关系可视化
2. **高效运维**: 快速定位问题，减少故障排查时间
3. **智能优化**: 基于AI的布局和资源优化建议
4. **统一平台**: 从物理层到逻辑层的统一管理

## 开发者指南

### API 快速示例

```bash
# 创建机柜
curl -X POST http://localhost:3000/api/v1/cabinets/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A01",
    "roomId": "room-uuid",
    "height": 42
  }'

# 根据 shortID 查询
curl -X POST http://localhost:3000/api/v1/search/by-shortid \
  -H "Content-Type: application/json" \
  -d '{"shortId": 100}'
```

完整 API 文档：[docs/API.md](docs/API.md)

### 数据库迁移

```bash
# 生成 Prisma Client
npm run prisma:generate

# 运行迁移
npm run prisma:migrate

# 打开 Prisma Studio
npm run prisma:studio
```

### 开发规范

详见 [CLAUDE.md](CLAUDE.md)：
- 所有请求用 body 传参，不拼接 URL
- 需要 shortID 的地方：机柜、面板、插头
- 修改后端代码后自动生效（nodemon）
- 需要迁移数据库时提示用户手动运行

## 常见问题

### Q: ShortID 是什么？

A: ShortID 是一个全局唯一的短整数ID，格式为 E-XXXXX（如 E-00001）。用于快速识别机柜、面板和线缆端点。详见 [docs/SHORTID.md](docs/SHORTID.md)

### Q: 为什么使用两个数据库？

A: PostgreSQL 存储业务数据，Neo4j 存储拓扑关系。这样可以兼顾事务完整性和高效的图查询。详见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### Q: 如何批量导入设备？

A: 使用批量部署功能，支持 Excel/CSV 导入。详见前端的"批量部署"页面。

### Q: 线缆如何入库？

A: 三种方式：
1. 手动入库：扫描两端 shortID
2. 单端连接：扫描插头连接端口
3. 双端连接：同时创建线缆和连接

详见 [docs/CABLE_MANAGEMENT.md](docs/CABLE_MANAGEMENT.md)

### Q: 光模块如何管理？

A: 完整的生命周期管理：采购入库 → 安装 → 转移 → 卸载 → 报废。支持移动历史追踪。详见 [docs/OPTICAL_MODULE.md](docs/OPTICAL_MODULE.md)

## 贡献指南

欢迎贡献代码、报告问题或提出建议

### 报告问题

请在 GitHub Issues 中提交问题，包含：
- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 截图（如果适用）

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 致谢

感谢所有贡献者和以下开源项目：
- [React](https://reactjs.org/)
- [Ant Design](https://ant.design/)
- [React Flow](https://reactflow.dev/)
- [Prisma](https://www.prisma.io/)
- [Neo4j](https://neo4j.com/)
- [Express](https://expressjs.com/)

---

**如果这个项目对你有帮助，请给个 ⭐ Star**
